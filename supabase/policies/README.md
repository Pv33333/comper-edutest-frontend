# Policies overview

- **profiles**: Only the owner (auth.uid() = id) can read/insert/update their profile.
- **tests**:
  - `select`: anyone can read `published = true`; creator can read own drafts.
  - `insert/update/delete`: only the creator (auth.uid() = created_by).
