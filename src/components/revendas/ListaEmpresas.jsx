import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Store } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const corClasses = {
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  green: "bg-green-100 text-green-800 border-green-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  pink: "bg-pink-100 text-pink-800 border-pink-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  red: "bg-red-100 text-red-800 border-red-200"
};

export default function ListaEmpresas({ empresas, loading, onEditar }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (empresas.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Store className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhuma empresa cadastrada ainda.</p>
          <p className="text-sm text-gray-400 mt-1">Comece cadastrando suas empresas de revenda!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {empresas.map((empresa) => (
        <Card key={empresa.id} className={`border-2 ${empresa.ativa ? '' : 'opacity-50'}`}>
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${empresa.ativa ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                {empresa.nome}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditar(empresa)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${corClasses[empresa.cor]} border-2`}>
                <p className="text-xs font-medium">Comissão</p>
                <p className="text-2xl font-bold">{empresa.porcentagem_comissao}%</p>
              </div>
              <Badge variant={empresa.ativa ? "default" : "secondary"} className="w-full justify-center">
                {empresa.ativa ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}