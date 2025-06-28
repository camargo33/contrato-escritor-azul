
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface TextPreviewCardProps {
  textPreview: string;
}

const TextPreviewCard = ({ textPreview }: TextPreviewCardProps) => {
  if (!textPreview) return null;

  return (
    <Card className="hover-lift transition-all duration-250">
      <CardHeader>
        <CardTitle className="text-subtitle flex items-center gap-2 text-secondary">
          <FileText className="h-5 w-5" />
          Prévia do Texto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-body">
          {textPreview}
        </p>
      </CardContent>
    </Card>
  );
};

export default TextPreviewCard;
