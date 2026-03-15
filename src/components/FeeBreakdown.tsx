import type { VaultFees } from "@/data/types";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

interface FeeBreakdownProps {
  fees: VaultFees;
}

export function FeeBreakdown({ fees }: FeeBreakdownProps) {
  const rows = [
    { label: "Management Fee", value: `${fees.management}% / year` },
    { label: "Performance Fee", value: `${fees.performance}% of profits` },
    { label: "Deposit Fee", value: fees.deposit === 0 ? "None" : `${fees.deposit}%` },
    { label: "Withdrawal Fee", value: fees.withdrawal === 0 ? "None" : `${fees.withdrawal}%` },
  ];

  return (
    <Table>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell className="text-muted-foreground">{row.label}</TableCell>
            <TableCell className="text-right font-medium">{row.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
