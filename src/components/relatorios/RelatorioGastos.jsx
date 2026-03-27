import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const tipoLabels = {
  alimentacao: "Alimentação",
  gasolina: "Gasolina", 
  diaria_funcionario: "Diárias",
  transporte: "Transporte",
  manutencao: "Manutenção",
  outros: "Outros"
};

export default function RelatorioGastos({ gastos, titulo = "Análise de Gastos" }) {
  // Agrupar gastos por tipo
  const gastosPorTipo = {};
  
  gastos.forEach(gasto => {
    const tipo = gasto.tipo;
    if (!gastosPorTipo[tipo]) {
      gastosPorTipo[tipo] = 0;
    }
    gastosPorTipo[tipo] += gasto.valor;
  });

  const dadosChart = Object.entries(gastosPorTipo).map(([tipo, valor]) => ({
    name: tipoLabels[tipo] || tipo,
    value: valor,
    porcentagem: ((valor / gastos.reduce((sum, g) => sum + g.valor, 0)) * 100).toFixed(1)
  }));

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dadosChart}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ porcentagem }) => `${porcentagem}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {dadosChart.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-2">
          {dadosChart.map((item, index) => (
            <div key={item.name} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CORES[index % CORES.length] }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="font-medium">R$ {item.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}