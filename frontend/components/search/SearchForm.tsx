'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Props {
  from: string;
  to: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
  onSubmit: () => void;
  showSubmitButton?: boolean;
}

export const SearchForm: React.FC<Props> = ({
  from,
  to,
  onChangeFrom,
  onChangeTo,
  onSubmit,
  showSubmitButton,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-1">
        <Label htmlFor="from-input">From</Label>
        <Input
          id="from-input"
          placeholder="Railway Station"
          value={from}
          onChange={(e) => onChangeFrom(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="to-input">To</Label>
        <Input
          id="to-input"
          placeholder="Government College"
          value={to}
          onChange={(e) => onChangeTo(e.target.value)}
        />
      </div>
      {showSubmitButton && (
        <Button className="mt-1 w-full" onClick={onSubmit}>
          Search routes
        </Button>
      )}
    </div>
  );
};
