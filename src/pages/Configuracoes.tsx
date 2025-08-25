import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus,
  Crown,
  Settings2,
  Loader2,
  DollarSign,
  Target,
  ArrowUpCircle,
  ArrowDownCircle,
  Image as ImageIcon,
  User,
  Cog
} from "lucide-react";
import { useUsuarios, usePromoverUsuario } from "@/hooks/useConfiguracoes";
import { UserDialog } from "@/components/Configuracoes/UserDialog";
import { ImageManager } from "@/components/Configuracoes/ImageManager";
import { ProfileDialog } from "@/components/Configuracoes/ProfileDialog";
import { RemoveUserDialog } from "@/components/Configuracoes/RemoveUserDialog";
import { useAuth } from "@/contexts/AuthContext";

export default function Configuracoes() {
  const { user: currentUser } = useAuth();
  const { data: usuarios, isLoading } = useUsuarios();
  const promoverUsuario = usePromoverUsuario();

  const handlePromover = async (userId: string, currentRole: string) => {
    const novoRole = currentRole === 'vendedor' ? 'admin' : 'vendedor';
    await promoverUsuario.mutateAsync({ userId, novoRole });
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Gerenciamento de usuários e configurações do sistema
        </p>
      </div>

      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
          <TabsTrigger value="usuarios" className="flex items-center gap-2 text-xs sm:text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden xs:inline">Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2 text-xs sm:text-sm">
            <Cog className="h-4 w-4" />
            <span className="hidden xs:inline">Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs sm:text-sm">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden xs:inline">Dashboard</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-6">
          {/* Estatísticas de Usuários */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usuarios?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Administradores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {usuarios?.filter(u => u.role === 'admin').length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Vendedores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">
                  {usuarios?.filter(u => u.role === 'vendedor').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gestão de Usuários */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestão de Usuários
                  </CardTitle>
                  <CardDescription>
                    Gerencie funções, comissões e metas dos usuários
                  </CardDescription>
                </div>
                <UserDialog mode="create" trigger={
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Usuário
                  </Button>
                } />
              </div>
            </CardHeader>
            <CardContent>
              {usuarios && usuarios.length > 0 ? (
                <div className="space-y-4">
                  {usuarios.map((usuario) => (
                    <div key={usuario.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {usuario.avatar_url ? (
                            <img 
                              src={usuario.avatar_url} 
                              alt={`Avatar de ${usuario.name}`}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold">
                              {usuario.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-medium truncate">{usuario.name}</p>
                            <Badge 
                              variant={usuario.role === 'admin' ? 'default' : 'secondary'}
                              className="text-xs flex-shrink-0"
                            >
                              {usuario.role === 'admin' ? (
                                <>
                                  <Crown className="h-3 w-3 mr-1" />
                                  <span className="hidden xs:inline">Administrador</span>
                                  <span className="xs:hidden">Admin</span>
                                </>
                              ) : (
                                'Vendedor'
                              )}
                            </Badge>
                            {usuario.user_id === currentUser?.id && (
                              <Badge variant="outline" className="text-xs">
                                Você
                              </Badge>
                            )}
                          </div>
                          
                          {/* Informações específicas para vendedores */}
                          {usuario.role === 'vendedor' && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {usuario.percentual_comissao || 0}% comissão
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Meta: {formatCurrency(usuario.meta_mensal)}
                              </div>
                            </div>
                          )}
                          
                          <p className="text-sm text-muted-foreground">
                            Criado em {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
                        {/* Configurar usuário */}
                        {usuario.role === 'vendedor' && (
                          <UserDialog 
                            user={usuario} 
                            mode="edit" 
                            trigger={
                              <Button size="sm" variant="outline" className="flex-1 sm:flex-initial">
                                <Settings2 className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Configurar</span>
                              </Button>
                            } 
                          />
                        )}
                        
                        {/* Promover/Rebaixar usuário */}
                        {usuario.user_id !== currentUser?.id && (
                          <Button 
                            size="sm" 
                            variant={usuario.role === 'vendedor' ? 'default' : 'outline'}
                            onClick={() => handlePromover(usuario.user_id, usuario.role)}
                            disabled={promoverUsuario.isPending}
                            className="flex-1 sm:flex-initial"
                          >
                            {usuario.role === 'vendedor' ? (
                              <>
                                <ArrowUpCircle className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Promover</span>
                              </>
                            ) : (
                              <>
                                <ArrowDownCircle className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Rebaixar</span>
                              </>
                            )}
                          </Button>
                        )}
                        
                        {/* Remover usuário */}
                        {usuario.user_id !== currentUser?.id && (
                          <div className="flex-1 sm:flex-initial">
                            <RemoveUserDialog user={usuario} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhum usuário encontrado
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Comece criando o primeiro usuário do sistema.
                  </p>
                  <UserDialog mode="create" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil do Usuário
              </CardTitle>
              <CardDescription>
                Configure suas informações pessoais e avatar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {currentUser?.avatar_url ? (
                    <img 
                      src={currentUser.avatar_url} 
                      alt="Avatar" 
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold">
                      {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="font-medium text-lg">{currentUser?.name}</p>
                  <p className="text-muted-foreground break-all">{currentUser?.email}</p>
                  <div className="mt-2">
                    <ProfileDialog trigger={
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Settings2 className="h-4 w-4 mr-2" />
                        Editar Perfil
                      </Button>
                    } />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configurações globais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Outras configurações do sistema serão adicionadas aqui conforme necessário.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Imagens do Dashboard
              </CardTitle>
              <CardDescription>
                Arraste e solte para reordenar • Clique para ativar/desativar • Hover para controles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}