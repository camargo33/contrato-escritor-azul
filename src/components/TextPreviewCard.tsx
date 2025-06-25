
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface TextPreviewCardProps {
  textPreview: string;
}

const TextPreviewCard = ({ textPreview }: TextPreviewCardProps) => {
  if (!textPreview) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-slate-700 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Prévia do Texto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 leading-relaxed">
          {textPreview}
        </p>
      </CardContent>
    </Card>
  );
};

export default TextPreviewCard;
