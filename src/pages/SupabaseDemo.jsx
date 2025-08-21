// src/pages/SupabaseDemo.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // dacă nu ai alias "@", schimbă în ../lib/supabaseClient

export default function SupabaseDemo() {
  const [envOk] = useState({
    url: !!import.meta.env.VITE_SUPABASE_URL,
    key: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  });
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [edgeResponse, setEdgeResponse] = useState(null);
  const logsRef = useRef([]);
  const [, force] = useState(0);

  const url = import.meta.env.VITE_SUPABASE_URL;

  const appendLog = (msg) => {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logsRef.current.push(line);
    if (logsRef.current.length > 200) logsRef.current.shift();
    force((x) => x + 1);
  };

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session ?? null);
      appendLog("Auth session loaded.");
    })();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session ?? null);
      appendLog(`Auth state changed: ${event}`);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      appendLog(`Error loading tests: ${error.message}`);
    } else {
      setTests(data || []);
      appendLog(`Loaded ${data?.length ?? 0} tests.`);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("tests-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tests" },
        (payload) => {
          appendLog(`Realtime event on tests: ${payload.eventType}`);
          loadTests();
        }
      )
      .subscribe((status) => {
        appendLog(`Realtime status: ${status}`);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) appendLog(`Magic link error: ${error.message}`);
    else appendLog(`Magic link sent to ${email}.`);
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    appendLog("Signed out.");
  };

  const pingEdge = async () => {
    try {
      setLoading(true);
      const endpoint = `${url}/functions/v1/hello`;
      const res = await fetch(endpoint);
      const json = await res.json();
      setEdgeResponse(json);
      appendLog(`Edge hello responded: ${res.status}`);
    } catch (err) {
      appendLog(`Edge error: ${err.message}`);
      setEdgeResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const masked = useMemo(
    () => ({
      url: envOk.url ? "OK" : "MISSING",
      key: envOk.key ? "OK" : "MISSING",
    }),
    [envOk]
  );

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-4">Supabase Demo (Cloud)</h1>

      <section className="mb-6 p-4 rounded-xl border">
        <h2 className="font-semibold mb-2">ENV check</h2>
        <ul className="list-disc ml-5">
          <li>
            VITE_SUPABASE_URL: <b>{masked.url}</b>
          </li>
          <li>
            VITE_SUPABASE_ANON_KEY: <b>{masked.key}</b>
          </li>
        </ul>
      </section>

      <section className="mb-6 p-4 rounded-xl border">
        <h2 className="font-semibold mb-2">Auth</h2>
        {session ? (
          <div className="flex items-center gap-3">
            <span className="text-sm">
              Logged in as <code>{session.user?.email}</code>
            </span>
            <button
              onClick={signOut}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={sendMagicLink} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="email@exemplu.ro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
            />
            <button
              disabled={loading}
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            >
              Trimite Magic Link
            </button>
          </form>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Notă: pentru inserare/actualizare pe tabele cu RLS, trebuie să fii
          logat.
        </p>
      </section>

      <section className="mb-6 p-4 rounded-xl border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold mb-2">Tests (published)</h2>
          <button
            onClick={loadTests}
            disabled={loading}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          >
            Reload
          </button>
        </div>
        {loading && <div className="text-sm">Loading...</div>}
        <pre className="bg-gray-50 p-3 rounded overflow-auto max-h-64">
          {JSON.stringify(tests, null, 2)}
        </pre>
      </section>

      <section className="mb-6 p-4 rounded-xl border">
        <div className="flex items-center gap-2">
          <button
            onClick={pingEdge}
            disabled={loading}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          >
            Ping Edge /hello
          </button>
          <span className="text-xs text-gray-500">
            Funcționează doar dacă ai deployat funcția în cloud.
          </span>
        </div>
        {edgeResponse && (
          <pre className="bg-gray-50 p-3 rounded overflow-auto mt-3">
            {JSON.stringify(edgeResponse, null, 2)}
          </pre>
        )}
      </section>

      <section className="mb-6 p-4 rounded-xl border">
        <h2 className="font-semibold mb-2">Logs</h2>
        <pre className="bg-gray-50 p-3 rounded overflow-auto max-h-48">
          {logsRef.current.join("\n")}
        </pre>
      </section>
    </div>
  );
}
