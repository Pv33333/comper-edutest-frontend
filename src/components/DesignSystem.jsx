import AppShell from '../../layouts/AppShell';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

export default function DesignSystem() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Design System – UI Kit</h1>
          <p className="text-[rgb(var(--muted))]">
            Buton, card, badge, input, select – premium, consistente.
          </p>
        </div>

        <Card>
          <div className="flex flex-wrap gap-3 items-center">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="subtle">Subtle</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Badge>Badge</Badge>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm text-[rgb(var(--muted))]">Nume</label>
              <Input placeholder="Ex: Maria Popescu" />
            </div>
            <div>
              <label className="block mb-1 text-sm text-[rgb(var(--muted))]">Clasă</label>
              <Select>
                <option>Clasa I</option>
                <option>Clasa II</option>
                <option>Clasa III</option>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button>Salvează</Button>
            <Button variant="outline">Anulează</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
