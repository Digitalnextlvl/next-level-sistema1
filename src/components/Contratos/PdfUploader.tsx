import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, X, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PdfUploaderProps {
  pdfUrl?: string;
  onPdfChange: (url: string | null) => void;
  disabled?: boolean;
}

export function PdfUploader({ pdfUrl, onPdfChange, disabled }: PdfUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar se é um PDF
    if (file.type !== 'application/pdf') {
      toast.error('Por favor, selecione apenas arquivos PDF');
      return;
    }

    // Validar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Gerar nome único para o arquivo
      const fileExt = 'pdf';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from('contratos-pdf')
        .upload(fileName, file);

      if (error) throw error;

      // Atualizar o estado com a URL do arquivo
      onPdfChange(data.path);
      toast.success('PDF uploaded com sucesso!');
      
    } catch (error) {
      toast.error('Erro ao fazer upload do PDF. Tente novamente.');
    } finally {
      setIsUploading(false);
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePdf = async () => {
    if (!pdfUrl) return;

    try {
      // Remover arquivo do storage
      const { error } = await supabase.storage
        .from('contratos-pdf')
        .remove([pdfUrl]);

      if (error) throw error;

      onPdfChange(null);
      toast.success('PDF removido com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover PDF. Tente novamente.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfUrl) return;

    try {
      const { data, error } = await supabase.storage
        .from('contratos-pdf')
        .download(pdfUrl);

      if (error) throw error;

      // Criar URL temporária para download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Erro ao baixar PDF. Tente novamente.');
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">PDF do Contrato</Label>
      
      {!pdfUrl ? (
        <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Clique para selecionar o PDF do contrato</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo 10MB • Apenas arquivos PDF
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Selecionar PDF'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-sm">PDF do Contrato</p>
                  <p className="text-xs text-muted-foreground">
                    Arquivo carregado com sucesso
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPdf}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemovePdf}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Substituir'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}