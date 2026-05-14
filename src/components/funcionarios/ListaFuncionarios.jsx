import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Users, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ListaFuncionarios({ funcionarios, loading, onEditar }) {
  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Funcionários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const funcionariosAtivos = (funcionarios || []).filter(f => f?.ativo);

  if (!funcionariosAtivos || funcionariosAtivos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhum funcionário cadastrado ainda.</p>
          <p className="text-sm text-gray-400 mt-1">
            Os funcionários aparecem aqui automaticamente quando você registra a primeira diária!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop View - Table */}
      <Card className="shadow-lg hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Funcionários ({funcionariosAtivos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Nome</th>
                  <th className="text-left p-3 font-medium">Telefone</th>
                  <th className="text-left p-3 font-medium">Observações</th>
                  <th className="text-left p-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcionariosAtivos.map((func) => (
                  <tr key={func.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium">{func.nome}</p>
                    </td>
                    <td className="p-3">
                      {func.telefone ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {func.telefone}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Não informado</span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-gray-600 max-w-xs truncate">
                      {func.observacoes || '-'}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditar(func)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar Info
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          <h3 className="font-bold text-lg">Funcionários ({funcionariosAtivos.length})</h3>
        </div>
        {funcionariosAtivos.map((func) => (
          <Card key={func.id} className="shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{func.nome}</h4>
                  {func.telefone ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Phone className="w-3 h-3" />
                      {func.telefone}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">Sem telefone cadastrado</p>
                  )}
                </div>
              </div>

              {func.observacoes && (
                <p className="text-sm text-gray-500 mb-3 italic">{func.observacoes}</p>
              )}

              <div className="pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditar(func)}
                  className="w-full"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Adicionar/Editar Informações
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}