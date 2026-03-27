import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ListaIngredientes({ ingredientes, loading, onEditar, onDeletar }) {
  const [deletando, setDeletando] = useState(null);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ingredientes.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">Nenhum ingrediente cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  const ingredientesAtivos = ingredientes.filter(i => i.ativo);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ingredientes Cadastrados ({ingredientesAtivos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ingredientesAtivos.map(ingrediente => {
              const estoqueAbaixoMinimo = ingrediente.estoque_atual <= ingrediente.estoque_minimo && ingrediente.estoque_minimo > 0;
              
              return (
                <div key={ingrediente.id} className={`border rounded-lg p-4 ${estoqueAbaixoMinimo ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{ingrediente.nome}</h4>
                        {estoqueAbaixoMinimo && (
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          R$ {ingrediente.preco_por_kg?.toFixed(2)}/{ingrediente.unidade === 'kg' ? 'kg' : ingrediente.unidade === 'litros' ? 'L' : 'un'}
                        </Badge>
                        <Badge variant="outline" className={estoqueAbaixoMinimo ? 'bg-orange-100 text-orange-700' : 'bg-green-50 text-green-700'}>
                          Estoque: {ingrediente.estoque_atual} {ingrediente.unidade === 'kg' ? 'kg' : ingrediente.unidade === 'litros' ? 'L' : 'un'}
                        </Badge>
                        {ingrediente.estoque_minimo > 0 && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600">
                            Mín: {ingrediente.estoque_minimo}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEditar(ingrediente)}>
                        <Pencil className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeletando(ingrediente)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deletando} onOpenChange={() => setDeletando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar ingrediente?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar "{deletando?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              onDeletar(deletando);
              setDeletando(null);
            }} className="bg-red-600 hover:bg-red-700">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}