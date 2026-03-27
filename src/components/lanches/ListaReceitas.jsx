import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Package } from "lucide-react";
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

export default function ListaReceitas({ receitas, loading, onEditar, onDeletar, onProduzir }) {
  const [deletando, setDeletando] = useState(null);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (receitas.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">Nenhuma receita cadastrada</p>
        </CardContent>
      </Card>
    );
  }

  const receitasAtivas = receitas.filter(r => r.ativo);

  const categorias = {
    pizza: { label: "Pizza", cor: "bg-red-100 text-red-800" },
    hamburguer: { label: "Hambúrguer", cor: "bg-yellow-100 text-yellow-800" },
    salgado: { label: "Salgado", cor: "bg-orange-100 text-orange-800" },
    petisco: { label: "Petisco", cor: "bg-green-100 text-green-800" },
    bebida: { label: "Bebida", cor: "bg-blue-100 text-blue-800" },
    outros: { label: "Outros", cor: "bg-gray-100 text-gray-800" }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Receitas Cadastradas ({receitasAtivas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {receitasAtivas.map(receita => {
              const categoria = categorias[receita.categoria] || categorias.outros;
              const lucro = receita.preco_venda_sugerido ? (receita.preco_venda_sugerido - receita.custo_total) : 0;
              
              return (
                <div key={receita.id} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{receita.nome_produto}</h4>
                        <Badge className={categoria.cor}>{categoria.label}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                        <div>
                          <span className="text-gray-500">Custo:</span>
                          <span className="ml-1 font-semibold text-red-600">R$ {receita.custo_total?.toFixed(2)}</span>
                        </div>
                        {receita.preco_venda_sugerido > 0 && (
                          <>
                            <div>
                              <span className="text-gray-500">Venda:</span>
                              <span className="ml-1 font-semibold text-green-600">R$ {receita.preco_venda_sugerido?.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Lucro:</span>
                              <span className="ml-1 font-semibold text-blue-600">R$ {lucro.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        {receita.tempo_preparo > 0 && (
                          <div>
                            <span className="text-gray-500">Tempo:</span>
                            <span className="ml-1 font-semibold">{receita.tempo_preparo} min</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-600">
                        <strong>Ingredientes:</strong> {receita.ingredientes?.map(i => i.ingrediente_nome).join(", ")}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" onClick={() => onProduzir(receita)} className="bg-green-600 hover:bg-green-700">
                        <Package className="w-4 h-4 mr-1" />
                        Produzir
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onEditar(receita)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeletando(receita)}>
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
            <AlertDialogTitle>Deletar receita?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar "{deletando?.nome_produto}"? Esta ação não pode ser desfeita.
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