import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  useUploadImage, 
  useCreateDashboardImage, 
  useUpdateDashboardImage,
  useDeleteDashboardImage,
  useAllDashboardImages
} from "@/hooks/useDashboardImages";
import { 
  Upload, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2,
  GripVertical,
  Image as ImageIcon
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import type { DashboardImage } from "@/hooks/useDashboardImages";

interface SortableImageItemProps {
  image: DashboardImage;
  onToggle: (id: string, ativo: boolean) => void;
  onDelete: (id: string) => void;
}

function SortableImageItem({ image, onToggle, onDelete }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-background border rounded-lg overflow-hidden ${
        isDragging ? 'shadow-lg z-50' : 'shadow-sm'
      }`}
    >
      <div className="relative aspect-video bg-muted">
        <img 
          src={image.url_imagem} 
          alt={`Banner ${image.ordem}`}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay com controles */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onToggle(image.id, !image.ativo)}
            >
              {image.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(image.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Indicadores de status */}
        <div className="absolute top-2 left-2 flex gap-2">
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            image.ativo 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-500 text-white'
          }`}>
            {image.ativo ? 'Ativo' : 'Inativo'}
          </div>
          <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
            #{image.ordem}
          </div>
        </div>

        {/* Handle para drag */}
        <div 
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 p-2 bg-white/80 rounded cursor-grab active:cursor-grabbing hover:bg-white/90 transition-colors"
        >
          <GripVertical className="h-4 w-4 text-gray-600" />
        </div>
      </div>
    </div>
  );
}

interface ImageUploadZoneProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

function ImageUploadZone({ onUpload, isUploading }: ImageUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      onUpload(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
        dragOver 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
      } ${isUploading ? 'opacity-50' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      
      <div className="space-y-4">
        {isUploading ? (
          <>
            <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Fazendo upload...</p>
          </>
        ) : (
          <>
            <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Arraste uma imagem aqui</p>
              <p className="text-xs text-muted-foreground">ou clique para selecionar</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Imagem
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function ImageManager() {
  const { data: images, isLoading } = useAllDashboardImages();
  const uploadImage = useUploadImage();
  const createImage = useCreateDashboardImage();
  const updateImage = useUpdateDashboardImage();
  const deleteImage = useDeleteDashboardImage();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleUpload = async (file: File) => {
    try {
      const imageUrl = await uploadImage.mutateAsync(file);
      const maxOrder = images ? Math.max(...images.map(img => img.ordem), 0) : 0;
      
      await createImage.mutateAsync({
        titulo: `Banner ${maxOrder + 1}`,
        url_imagem: imageUrl,
        ordem: maxOrder + 1,
      });
    } catch (error) {
      // Error already handled by mutation hooks
    }
  };

  const handleToggle = async (id: string, ativo: boolean) => {
    await updateImage.mutateAsync({ id, data: { ativo } });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta imagem?')) {
      await deleteImage.mutateAsync(id);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && images) {
      const oldIndex = images.findIndex(item => item.id === active.id);
      const newIndex = images.findIndex(item => item.id === over?.id);

      const newImages = arrayMove(images, oldIndex, newIndex);
      
      // Atualizar a ordem de todas as imagens afetadas
      const updatePromises = newImages.map((image, index) => 
        updateImage.mutateAsync({ 
          id: image.id, 
          data: { ordem: index + 1 } 
        })
      );

      await Promise.all(updatePromises);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const sortedImages = images?.sort((a, b) => a.ordem - b.ordem) || [];

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <ImageUploadZone 
        onUpload={handleUpload}
        isUploading={uploadImage.isPending || createImage.isPending}
      />

      {/* Images Grid */}
      {sortedImages.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GripVertical className="h-4 w-4" />
            <span>Arraste para reordenar as imagens</span>
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={sortedImages.map(img => img.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedImages.map((image) => (
                  <SortableImageItem
                    key={image.id}
                    image={image}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhuma imagem configurada
          </h3>
          <p className="text-muted-foreground">
            Adicione imagens para o carousel do dashboard
          </p>
        </div>
      )}
    </div>
  );
}