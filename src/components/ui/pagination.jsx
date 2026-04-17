import React from "react";
import { Button } from "./button";

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center mt-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
      <Button 
        variant="outline" 
        size="sm"
        disabled={meta.page <= 1} 
        onClick={() => { 
          onPageChange(meta.page - 1); 
          window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }}
      >
        Anterior
      </Button>
      <span className="text-sm font-medium text-gray-500">
        Página {meta.page} de {meta.totalPages}
      </span>
      <Button 
        variant="outline" 
        size="sm"
        disabled={meta.page >= meta.totalPages} 
        onClick={() => {
          onPageChange(meta.page + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        Próxima
      </Button>
    </div>
  );
}
