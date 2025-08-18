import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  useUploadImage, 
  useCreateDashboardImage, 
  useUpdateDashboardImage, 
  type DashboardImage, 
  type CreateImageData 
} from "@/hooks/useDashboardImages";
import { Plus, Edit, Upload, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageDialogProps {
  image?: DashboardImage;
  mode?: 'create' | 'edit';
  trigger?: React.ReactNode;
}

export function ImageDialog({ image, mode = 'create', trigger }: ImageDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateImageData>({
    titulo: image?.titulo || '',
    descricao: image?.descricao || '',
    url_imagem: image?.url_imagem || '',
    ordem: image?.ordem || 0,
    tipo: image?.tipo || 'banner',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(image?.url_imagem || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useUploadImage();
  const createImage = useCreateDashboardImage();
  const updateImage = useUpdateDashboardImage();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = formData.url_imagem;

      // Upload nova imagem se selecionada
      if (selectedFile) {
        imageUrl = await uploadImage.mutateAsync(selectedFile);
      }

      const finalData = { ...formData, url_imagem: imageUrl };

      if (mode === 'edit' && image) {
        await updateImage.mutateAsync({ id: image.id, data: finalData });
      } else {
        await createImage.mutateAsync(finalData);
      }

      setOpen(false);
      if (mode === 'create') {
        setFormData({
          titulo: '',
          descricao: '',
          url_imagem: '',
          ordem: 0,
          tipo: 'banner',
        });
        setPreviewUrl('');
        setSelectedFile(null);
      }
    } catch (error) {
      // Error already handled by mutation hooks
    }
  };

  const isLoading = uploadImage.isPending || createImage.isPending || updateImage.isPending;

  const defaultTrigger = (
    <Button>
      {mode === 'create' ? (
        <>
          <Plus className="h-4 w-4 mr-2" />
          Nova Imagem
        </>
      ) : (
        <>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </>
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {mode === 'create' ? 'Nova Imagem do Dashboard' : 'Editar Imagem'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preview da imagem */}
          {previewUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          )}

          {/* Upload de arquivo */}
          <div className="space-y-2">
            <Label>Imagem</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {selectedFile ? selectedFile.name : 'Selecionar Imagem'}
            </Button>
          </div>

          {/* URL alternativa */}
          <div>
            <Label htmlFor="url_imagem">Ou URL da Imagem</Label>
            <Input
              id="url_imagem"
              value={formData.url_imagem}
              onChange={(e) => {
                setFormData({ ...formData, url_imagem: e.target.value });
                setPreviewUrl(e.target.value);
              }}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="ordem">Ordem</Label>
              <Input
                id="ordem"
                type="number"
                min="0"
                value={formData.ordem}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  ordem: parseInt(e.target.value) || 0 
                })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              placeholder="Descrição da imagem..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || (!selectedFile && !formData.url_imagem)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}