import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, TrendingUp, Package, DollarSign, Calendar as CalendarIcon, Receipt, Users as UsersIcon, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatePresence } from "framer-motion";

import FormCompra from "../components/compras/FormCompra";
import ListaCompras from "../components/compras/ListaCompras";
import FormVenda from "../components/vendas/FormVenda";
import ListaVendas from "../components/vendas/ListaVendas";
import FormProduto from "../components/estoque/FormProduto";
import ListaProdutos from "../components/estoque/ListaProdutos";
import FormMovimentacao from "../components/estoque/FormMovimentacao";
import HistoricoMovimentacoes from "../components/estoque/HistoricoMovimentacoes";
import ResumoEstoque from "../components/estoque/ResumoEstoque";
import NotificationManager from "../components/mobile/NotificationManager";
import FormGasto from "../components/gastos/FormGasto";
import ListaGastos from "../components/gastos/ListaGastos";
import FormFuncionario from "../components/funcionarios/FormFuncionario";
import ListaFuncionarios from "../components/funcionarios/ListaFuncionarios";
import FormDiaria from "../components/funcionarios/FormDiaria";
import ListaDiarias from "../components/funcionarios/ListaDiarias";
import OfflineManager, { useOffline } from "../components/mobile/OfflineManager";
import { Badge } from "@/components/ui/badge";
import PagamentosControle from "../components/controle/PagamentosControle";
import CalendarioControle from "../components/controle/CalendarioControle";
import FormIngrediente from "../components/lanches/FormIngrediente";
import ListaIngredientes from "../components/lanches/ListaIngredientes";
import FormReceita from "../components/lanches/FormReceita";
import ListaReceitas from "../components/lanches/ListaReceitas";
import FormProducao from "../components/lanches/FormProducao";
import FormPedido from "../components/lanches/FormPedido";
import ListaPedidos from "../components/lanches/ListaPedidos";
import GerenciadorLotes from "../components/estoque/GerenciadorLotes";
import GerenciadorFornecedores from "../components/estoque/GerenciadorFornecedores";
import AlertasInteligentes from "../components/estoque/AlertasInteligentes";
import SugestaoCompras from "../components/estoque/SugestaoCompras";
import RelatorioGiroEstoque from "../components/estoque/RelatorioGiroEstoque";

export default function ControlePage() {
  const [activeTab, setActiveTab] = useState("vendas");
  const [pagamentosTab, setPagamentosTab] = useState("calendario");
  const [user, setUser] = useState(null);
  const [showFormCompra, setShowFormCompra] = useState(false);
  const [editandoCompra, setEditandoCompra] = useState(null);
  const [showFormVenda, setShowFormVenda] = useState(false);
  const [editandoVenda, setEditandoVenda] = useState(null);
  const [showFormProduto, setShowFormProduto] = useState(false);
  const [showFormMovimentacao, setShowFormMovimentacao] = useState(false);
  const [editandoProduto, setEditandoProduto] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [estoqueTab, setEstoqueTab] = useState("produtos");
  const [showFormGasto, setShowFormGasto] = useState(false);
  const [editandoGasto, setEditandoGasto] = useState(null);
  const [showFormFuncionario, setShowFormFuncionario] = useState(false);
  const [showFormDiaria, setShowFormDiaria] = useState(false);
  const [editandoFuncionario, setEditandoFuncionario] = useState(null);
  const [editandoDiaria, setEditandoDiaria] = useState(null);
  const [funcionariosTab, setFuncionariosTab] = useState("diarias");
  const [lanchesTab, setLanchesTab] = useState("receitas");
  const [showFormIngrediente, setShowFormIngrediente] = useState(false);
  const [editandoIngrediente, setEditandoIngrediente] = useState(null);
  const [showFormReceita, setShowFormReceita] = useState(false);
  const [editandoReceita, setEditandoReceita] = useState(null);
  const [showFormProducao, setShowFormProducao] = useState(false);
  const [receitaProduzir, setReceitaProduzir] = useState(null);
  const [showFormPedido, setShowFormPedido] = useState(false);
  const [diasAlertaPedido, setDiasAlertaPedido] = useState(3);

  const queryClient = useQueryClient();
  const { isOnline, addToQueue } = useOffline();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setDiasAlertaPedido(currentUser.dias_alerta_pedido_pendente || 3);
    };
    loadUser();
  }, []);

  const { data: compras = [], isLoading: loadingCompras } = useQuery({
    queryKey: ['compras'],
    queryFn: async () => {
      const result = await base44.entities.Compra.filter(
        { created_by: user?.email },
        '-data_compra'
      );
      return result;
    },
    enabled: !!user,
  });

  const { data: vendas = [], isLoading: loadingVendas } = useQuery({
    queryKey: ['vendas'],
    queryFn: async () => {
      const result = await base44.entities.Venda.filter(
        { created_by: user?.email },
        '-data_venda'
      );
      return result;
    },
    enabled: !!user,
  });

  const { data: produtos = [], isLoading: loadingProdutos } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      const result = await base44.entities.Produto.filter(
        { created_by: user?.email },
        '-created_date'
      );
      return result;
    },
    enabled: !!user,
  });

  const { data: movimentacoes = [], isLoading: loadingMovimentacoes } = useQuery({
    queryKey: ['movimentacoes-estoque'],
    queryFn: async () => {
      const result = await base44.entities.MovimentacaoEstoque.filter(
        { created_by: user?.email },
        '-data'
      );
      return result;
    },
    enabled: !!user,
  });

  const { data: gastos = [], isLoading: loadingGastos } = useQuery({
    queryKey: ['gastos-operacionais'],
    queryFn: async () => {
      const result = await base44.entities.GastoOperacional.filter(
        { created_by: user?.email },
        '-data'
      );
      return result;
    },
    enabled: !!user,
  });

  const { data: funcionarios = [], isLoading: loadingFuncionarios } = useQuery({
    queryKey: ['funcionarios'],
    queryFn: async () => {
      const result = await base44.entities.Funcionario.filter(
        { created_by: user?.email },
        'nome'
      );
      return result;
    },
    enabled: !!user,
  });

  const { data: diarias = [], isLoading: loadingDiarias } = useQuery({
    queryKey: ['diarias'],
    queryFn: async () => {
      const result = await base44.entities.Diaria.filter(
        { created_by: user?.email },
        '-data'
      );
      return result;
    },
    enabled: !!user,
  });

  const { data: ingredientes = [], isLoading: loadingIngredientes } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: async () => {
      const result = await base44.entities.Ingrediente.filter(
        { created_by: user?.email },
        'nome'
      );
      return result;
    },
    enabled: !!user,
  });

  const { data: receitas = [], isLoading: loadingReceitas } = useQuery({
    queryKey: ['receitas'],
    queryFn: async () => {
      const result = await base44.entities.ReceitaProduto.filter(
        { created_by: user?.email },
        'nome_produto'
      );
      return result;
    },
    enabled: !!user,
  });

  const { data: producoes = [], isLoading: loadingProducoes } = useQuery({
    queryKey: ['producoes'],
    queryFn: async () => {
      const result = await base44.entities.ProducaoLanche.filter(
        { created_by: user?.email },
        '-data_producao'
      );
      return result;
    },
    enabled: !!user,
  });

  const { data: pedidos = [], isLoading: loadingPedidos } = useQuery({
    queryKey: ['pedidos'],
    queryFn: async () => {
      const result = await base44.entities.Pedido.filter(
        { created_by: user?.email },
        '-data_pedido'
      );
      return result;
    },
    enabled: !!user,
  });

  const createCompraMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_compra', { ...data, created_by: user?.email });
        throw new Error('offline');
      }

      const compraCriada = await base44.entities.Compra.create(data);

      if (data.adicionar_estoque) {
        // Se já tem produto no estoque
        if (data.produto_estoque_id) {
          const produto = produtos.find(p => p.id === data.produto_estoque_id);

          if (produto && produto.controla_estoque) {
            const novoEstoque = produto.estoque_atual + data.quantidade;
            await base44.entities.Produto.update(produto.id, {
              estoque_atual: novoEstoque
            });

            await base44.entities.MovimentacaoEstoque.create({
              produto_id: produto.id,
              produto_nome: produto.nome,
              tipo: 'entrada',
              quantidade: data.quantidade,
              data: data.data_compra,
              origem: 'compra',
              observacoes: `Compra - ${data.fornecedor || 'Fornecedor não informado'}`,
              created_by: user?.email
            });
          }
        } else {
          // Criar novo produto no estoque
          const novoProduto = await base44.entities.Produto.create({
            nome: data.produto,
            unidade: data.unidade_compra,
            estoque_atual: data.quantidade,
            estoque_minimo: 0,
            controla_estoque: true,
            ativo: true,
            notificar_estoque_baixo: true,
            created_by: user?.email
          });

          // Registrar movimentação
          await base44.entities.MovimentacaoEstoque.create({
            produto_id: novoProduto.id,
            produto_nome: novoProduto.nome,
            tipo: 'entrada',
            quantidade: data.quantidade,
            data: data.data_compra,
            origem: 'compra',
            observacoes: `Compra inicial - ${data.fornecedor || 'Fornecedor não informado'}`,
            created_by: user?.email
          });
        }
      }

      return compraCriada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      setShowFormCompra(false);
      setEditandoCompra(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        alert('✅ Compra salva! Será sincronizada quando voltar online.');
        setShowFormCompra(false);
        setEditandoCompra(null);
      }
    }
  });

  const updateCompraMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Compra.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      setShowFormCompra(false);
      setEditandoCompra(null);
    },
  });

  const deleteCompraMutation = useMutation({
    mutationFn: (id) => base44.entities.Compra.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
    },
  });

  const createVendaMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_venda', data);
        throw new Error('offline');
      }

      // Criar cliente automaticamente se não existir
      if (data.cliente && data.cliente.trim()) {
        const nomeCliente = data.cliente.trim();
        const clientesExistentes = await base44.entities.Cliente.filter({
          nome: nomeCliente,
          created_by: user?.email
        });

        if (clientesExistentes.length === 0) {
          await base44.entities.Cliente.create({
            nome: nomeCliente,
            ativo: true,
            created_by: user?.email
          });
        }
      }

      const vendaCriada = await base44.entities.Venda.create(data);

      if (data.descontar_estoque && data.produto_estoque_id) {
        const produto = produtos.find(p => p.id === data.produto_estoque_id);

        if (produto && produto.controla_estoque) {
          const novoEstoque = Math.max(0, produto.estoque_atual - data.quantidade);
          await base44.entities.Produto.update(produto.id, {
            estoque_atual: novoEstoque
          });

          await base44.entities.MovimentacaoEstoque.create({
            produto_id: produto.id,
            produto_nome: produto.nome,
            tipo: 'saida',
            quantidade: data.quantidade,
            data: data.data_venda,
            origem: 'venda',
            observacoes: `Venda - ${data.cliente || 'Cliente não informado'}`,
            created_by: user?.email
          });
        }
      }

      return vendaCriada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setShowFormVenda(false);
      setEditandoVenda(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        alert('✅ Venda salva! Será sincronizada quando voltar online.');
        setShowFormVenda(false);
        setEditandoVenda(null);
      }
    }
  });

  const updateVendaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Venda.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      setShowFormVenda(false);
      setEditandoVenda(null);
    },
  });

  const deleteVendaMutation = useMutation({
    mutationFn: (id) => base44.entities.Venda.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
    },
  });

  const createProdutoMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_produto', data);
        throw new Error('offline');
      }
      return base44.entities.Produto.create({ ...data, created_by: user?.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setShowFormProduto(false);
      setEditandoProduto(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        alert('✅ Produto salvo! Será sincronizado quando voltar online.');
        setShowFormProduto(false);
        setEditandoProduto(null);
      }
    }
  });

  const updateProdutoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Produto.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setShowFormProduto(false);
      setEditandoProduto(null);
    },
  });

  const createMovimentacaoMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_movimentacao', data);
        throw new Error('offline');
      }

      await base44.entities.MovimentacaoEstoque.create({ ...data, created_by: user?.email });

      const produto = produtos.find(p => p.id === data.produto_id);
      if (produto) {
        let novoEstoque = produto.estoque_atual;

        if (data.tipo === 'entrada') {
          novoEstoque += data.quantidade;
        } else if (data.tipo === 'saida' || data.tipo === 'perda') {
          novoEstoque -= data.quantidade;
        } else if (data.tipo === 'ajuste') {
          novoEstoque = data.quantidade;
        }

        await base44.entities.Produto.update(produto.id, {
          estoque_atual: Math.max(0, novoEstoque)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      setShowFormMovimentacao(false);
      setProdutoSelecionado(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        alert('✅ Movimentação salva! Será sincronizada quando voltar online.');
        setShowFormMovimentacao(false);
        setProdutoSelecionado(null);
      }
    }
  });

  const createGastoMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_gasto', data);
        throw new Error('offline');
      }

      if (data.tipo === 'diaria_funcionario' && data.funcionario) {
        const nomeFuncionario = data.funcionario.trim();
        const funcionariosExistentes = await base44.entities.Funcionario.filter({
          nome: nomeFuncionario,
          created_by: user?.email
        });

        if (funcionariosExistentes.length === 0) {
          await base44.entities.Funcionario.create({
            nome: nomeFuncionario,
            ativo: true,
            created_by: user?.email
          });
        }
      }

      return base44.entities.GastoOperacional.create({ ...data, created_by: user?.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos-operacionais'] });
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      setShowFormGasto(false);
      setEditandoGasto(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        alert('✅ Gasto salvo! Será sincronizado quando voltar online.');
        setShowFormGasto(false);
        setEditandoGasto(null);
      }
    }
  });

  const updateGastoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GastoOperacional.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos-operacionais'] });
      setShowFormGasto(false);
      setEditandoGasto(null);
    },
  });

  const deleteGastoMutation = useMutation({
    mutationFn: (id) => base44.entities.GastoOperacional.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos-operacionais'] });
    },
  });

  const createFuncionarioMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_funcionario', data);
        throw new Error('offline');
      }
      return base44.entities.Funcionario.create({ ...data, created_by: user?.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      setShowFormFuncionario(false);
      setEditandoFuncionario(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        alert('✅ Funcionário salvo! Será sincronizado quando voltar online.');
        setShowFormFuncionario(false);
        setEditandoFuncionario(null);
      }
    }
  });

  const updateFuncionarioMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Funcionario.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      setShowFormFuncionario(false);
      setEditandoFuncionario(null);
    },
  });

  const createDiariaMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_diaria', { ...data, created_by: user?.email });
        throw new Error('offline');
      }

      const nomeFuncionario = data.funcionario_nome.trim();
      const funcionariosExistentes = await base44.entities.Funcionario.filter({
        nome: nomeFuncionario,
        created_by: user?.email
      });

      let funcionarioId;
      if (funcionariosExistentes.length === 0) {
        const novoFuncionario = await base44.entities.Funcionario.create({
          nome: nomeFuncionario,
          ativo: true,
          created_by: user?.email
        });
        funcionarioId = novoFuncionario.id;
      } else {
        funcionarioId = funcionariosExistentes[0].id;
      }

      return base44.entities.Diaria.create({
        ...data,
        funcionario_id: funcionarioId,
        created_by: user?.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diarias'] });
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      setShowFormDiaria(false);
      setEditandoDiaria(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        alert('✅ Diária salva! Será sincronizada quando voltar online.');
        setShowFormDiaria(false);
        setEditandoDiaria(null);
      }
    }
  });

  const updateDiariaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Diaria.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diarias'] });
      setShowFormDiaria(false);
      setEditandoDiaria(null);
    },
  });

  const deleteDiariaMutation = useMutation({
    mutationFn: (id) => base44.entities.Diaria.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diarias'] });
    },
  });

  const handleSubmitCompra = async (dados) => {
    if (editandoCompra) {
      updateCompraMutation.mutate({ id: editandoCompra.id, data: dados });
    } else {
      createCompraMutation.mutate(dados);
    }
  };

  const handleEditarCompra = (compra) => {
    setEditandoCompra(compra);
    setShowFormCompra(true);
  };

  const handleDeletarCompra = (compra) => {
    deleteCompraMutation.mutate(compra.id);
  };

  const handleSubmitVenda = async (dados) => {
    if (editandoVenda) {
      updateVendaMutation.mutate({ id: editandoVenda.id, data: dados });
    } else {
      createVendaMutation.mutate(dados);
    }
  };

  const handleEditarVenda = (venda) => {
    setEditandoVenda(venda);
    setShowFormVenda(true);
  };

  const handleDeletarVenda = (venda) => {
    deleteVendaMutation.mutate(venda.id);
  };

  const handleSubmitProduto = async (dados) => {
    if (editandoProduto) {
      updateProdutoMutation.mutate({ id: editandoProduto.id, data: dados });
    } else {
      createProdutoMutation.mutate(dados);
    }
  };

  const handleEditarProduto = (produto) => {
    setEditandoProduto(produto);
    setShowFormProduto(true);
  };

  const handleAdicionarMovimentacao = (produto, tipo) => {
    setProdutoSelecionado({ ...produto, tipoInicial: tipo });
    setShowFormMovimentacao(true);
  };

  const handleSubmitMovimentacao = async (dados) => {
    createMovimentacaoMutation.mutate(dados);
  };

  const handleSubmitGasto = async (dados) => {
    if (editandoGasto) {
      updateGastoMutation.mutate({ id: editandoGasto.id, data: dados });
    } else {
      createGastoMutation.mutate(dados);
    }
  };

  const handleEditarGasto = (gasto) => {
    setEditandoGasto(gasto);
    setShowFormGasto(true);
  };

  const handleDeletarGasto = (gasto) => {
    deleteGastoMutation.mutate(gasto.id);
  };

  const handleSubmitFuncionario = async (dados) => {
    if (editandoFuncionario) {
      updateFuncionarioMutation.mutate({ id: editandoFuncionario.id, data: dados });
    } else {
      createFuncionarioMutation.mutate(dados);
    }
  };

  const handleEditarFuncionario = (func) => {
    setEditandoFuncionario(func);
    setShowFormFuncionario(true);
  };

  const handleSubmitDiaria = async (dados) => {
    if (editandoDiaria) {
      updateDiariaMutation.mutate({ id: editandoDiaria.id, data: dados });
    } else {
      createDiariaMutation.mutate(dados);
    }
  };

  const handleEditarDiaria = (diaria) => {
    setEditandoDiaria(diaria);
    setShowFormDiaria(true);
  };

  const handleDeletarDiaria = (diaria) => {
    deleteDiariaMutation.mutate(diaria.id);
  };

  const handleMarcarDiariaPaga = async (diaria) => {
    updateDiariaMutation.mutate({
      id: diaria.id,
      data: { ...diaria, pago: true }
    });
  };

  const createIngredienteMutation = useMutation({
    mutationFn: (data) => base44.entities.Ingrediente.create({ ...data, created_by: user?.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
      setShowFormIngrediente(false);
      setEditandoIngrediente(null);
    },
  });

  const updateIngredienteMutation = useMutation({
    mutationFn: async ({ id, data, ingredienteAntigo }) => {
      await base44.entities.Ingrediente.update(id, data);

      // Recalcular todas as receitas que usam este ingrediente
      const receitasAfetadas = receitas.filter(receita => 
        receita.ingredientes?.some(ing => ing.ingrediente_id === id)
      );

      const precoAntigoCorrigido = ingredienteAntigo.preco_corrigido_kg || ingredienteAntigo.preco_por_kg || 0;
      const precoNovoCorrigido = data.preco_corrigido_kg || data.preco_por_kg || 0;
      const percentualAumento = precoAntigoCorrigido > 0 
        ? ((precoNovoCorrigido - precoAntigoCorrigido) / precoAntigoCorrigido) * 100 
        : 0;

      const limiteAlerta = user?.limite_aumento_custo_receita || 15;

      for (const receita of receitasAfetadas) {
        let custoTotal = 0;
        
        for (const item of receita.ingredientes) {
          const ing = item.ingrediente_id === id 
            ? { ...ingredientes.find(i => i.id === id), ...data } // Usar novo preço
            : ingredientes.find(i => i.id === item.ingrediente_id);
          
          if (ing) {
            const precoUsar = ing.preco_corrigido_kg || ing.preco_por_kg || 0;
            const quantidade = item.quantidade_kg || item.quantidade || 0;
            custoTotal += precoUsar * quantidade;
          }
        }

        const custoAntigo = receita.custo_total || 0;
        const aumentoReceita = custoAntigo > 0 ? ((custoTotal - custoAntigo) / custoAntigo) * 100 : 0;

        await base44.entities.ReceitaProduto.update(receita.id, {
          ...receita,
          custo_total: custoTotal
        });

        // Criar alerta se ultrapassar o limite
        if (aumentoReceita > limiteAlerta) {
          alert(`⚠️ ATENÇÃO: A receita "${receita.nome_produto}" teve aumento de ${aumentoReceita.toFixed(1)}% no custo!\nIngrediente: ${data.nome}\nCusto anterior: R$ ${custoAntigo.toFixed(2)}\nNovo custo: R$ ${custoTotal.toFixed(2)}`);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      setShowFormIngrediente(false);
      setEditandoIngrediente(null);
    },
  });

  const deleteIngredienteMutation = useMutation({
    mutationFn: (id) => base44.entities.Ingrediente.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
    },
  });

  const handleSubmitIngrediente = async (dados) => {
    if (editandoIngrediente) {
      updateIngredienteMutation.mutate({ 
        id: editandoIngrediente.id, 
        data: dados,
        ingredienteAntigo: editandoIngrediente
      });
    } else {
      createIngredienteMutation.mutate(dados);
    }
  };

  const handleEditarIngrediente = (ing) => {
    setEditandoIngrediente(ing);
    setShowFormIngrediente(true);
  };

  const handleDeletarIngrediente = (ing) => {
    deleteIngredienteMutation.mutate(ing.id);
  };

  const createReceitaMutation = useMutation({
    mutationFn: (data) => base44.entities.ReceitaProduto.create({ ...data, created_by: user?.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      setShowFormReceita(false);
      setEditandoReceita(null);
    },
  });

  const updateReceitaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ReceitaProduto.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      setShowFormReceita(false);
      setEditandoReceita(null);
    },
  });

  const deleteReceitaMutation = useMutation({
    mutationFn: (id) => base44.entities.ReceitaProduto.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
    },
  });

  const handleSubmitReceita = async (dados) => {
    if (editandoReceita) {
      updateReceitaMutation.mutate({ id: editandoReceita.id, data: dados });
    } else {
      createReceitaMutation.mutate(dados);
    }
  };

  const handleEditarReceita = (rec) => {
    setEditandoReceita(rec);
    setShowFormReceita(true);
  };

  const handleDeletarReceita = (rec) => {
    deleteReceitaMutation.mutate(rec.id);
  };

  const handleProduzir = (receita) => {
    setReceitaProduzir(receita);
    setShowFormProducao(true);
  };

  const createProducaoMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.ProducaoLanche.create({ ...data, created_by: user?.email });

      if (data.descontar_estoque) {
        const receita = receitas.find(r => r.id === data.receita_id);
        if (receita && receita.ingredientes) {
          for (const item of receita.ingredientes) {
            const ing = ingredientes.find(i => i.id === item.ingrediente_id);
            if (ing) {
              const quantidadeTotal = (item.quantidade_kg || item.quantidade) * data.quantidade;
              const novoEstoque = Math.max(0, ing.estoque_atual - quantidadeTotal);
              await base44.entities.Ingrediente.update(ing.id, { estoque_atual: novoEstoque });
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producoes'] });
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
      setShowFormProducao(false);
      setReceitaProduzir(null);
    },
  });

  const handleSubmitProducao = async (dados) => {
    createProducaoMutation.mutate(dados);
  };

  const converterParaKg = (quantidade, unidade) => {
    switch(unidade) {
      case 'g':
      case 'gramas': 
        return quantidade / 1000;
      case 'ml': 
        return quantidade / 1000;
      case 'l':
      case 'litros': 
        return quantidade;
      case 'kg': 
        return quantidade;
      default: 
        return quantidade;
    }
  };

  const createPedidoMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_pedido', { ...data, created_by: user?.email });
        throw new Error('offline');
      }

      await base44.entities.Pedido.create({ ...data, created_by: user?.email });

      for (const item of data.itens) {
        if (item.tipo === "produto") {
          const produto = produtos.find(p => p.id === item.id_referencia);
          if (produto && produto.controla_estoque) {
            const novoEstoque = Math.max(0, produto.estoque_atual - item.quantidade);
            await base44.entities.Produto.update(produto.id, { estoque_atual: novoEstoque });

            await base44.entities.MovimentacaoEstoque.create({
              produto_id: produto.id,
              produto_nome: produto.nome,
              tipo: 'saida',
              quantidade: item.quantidade,
              data: data.data_pedido,
              origem: 'venda',
              observacoes: `Pedido ${data.numero_pedido} - ${data.cliente || 'Cliente não informado'}`,
              created_by: user?.email
            });
          }
        } else if (item.tipo === "receita") {
          const receita = receitas.find(r => r.id === item.id_referencia);
          if (receita && receita.ingredientes) {
            for (const ingredienteReceita of receita.ingredientes) {
              const ing = ingredientes.find(i => i.id === ingredienteReceita.ingrediente_id);
              if (ing) {
                let qtdNecessaria;
                if (ingredienteReceita.quantidade_kg) {
                  qtdNecessaria = ingredienteReceita.quantidade_kg * item.quantidade;
                } else {
                  const qtdConvertida = converterParaKg(ingredienteReceita.quantidade, ingredienteReceita.unidade || 'kg');
                  qtdNecessaria = qtdConvertida * item.quantidade;
                }

                const novoEstoque = Math.max(0, ing.estoque_atual - qtdNecessaria);
                await base44.entities.Ingrediente.update(ing.id, { estoque_atual: novoEstoque });
              }
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      setShowFormPedido(false);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        alert('✅ Pedido salvo! Será sincronizado quando voltar online.');
        setShowFormPedido(false);
      }
    }
  });

  const updatePedidoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Pedido.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });

  const deletePedidoMutation = useMutation({
    mutationFn: (id) => base44.entities.Pedido.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });

  const handleSubmitPedido = async (dados) => {
    createPedidoMutation.mutate(dados);
  };

  const handleDeletarPedido = (pedido) => {
    deletePedidoMutation.mutate(pedido.id);
  };

  const handleAtualizarStatusPedido = async (pedido, novoStatus) => {
    updatePedidoMutation.mutate({
      id: pedido.id,
      data: { ...pedido, status: novoStatus }
    });
  };

  const handleSync = async (item) => {
    if (item.type === 'create_compra') {
      const data = item.data;
      await base44.entities.Compra.create(data);

      if (data.adicionar_estoque) {
        if (data.produto_estoque_id) {
          const productData = await base44.entities.Produto.get(data.produto_estoque_id);
          if (productData && productData.controla_estoque) {
            const novoEstoque = productData.estoque_atual + data.quantidade;
            await base44.entities.Produto.update(productData.id, { estoque_atual: novoEstoque });
            await base44.entities.MovimentacaoEstoque.create({
              produto_id: productData.id,
              produto_nome: productData.nome,
              tipo: 'entrada',
              quantidade: data.quantidade,
              data: data.data_compra,
              origem: 'compra',
              observacoes: `Compra - ${data.fornecedor || 'Fornecedor não informado'}`,
              created_by: data.created_by
            });
          }
        } else {
          const novoProduto = await base44.entities.Produto.create({
            nome: data.produto,
            unidade: data.unidade_compra,
            estoque_atual: data.quantidade,
            estoque_minimo: 0,
            controla_estoque: true,
            ativo: true,
            notificar_estoque_baixo: true,
            created_by: data.created_by
          });

          await base44.entities.MovimentacaoEstoque.create({
            produto_id: novoProduto.id,
            produto_nome: novoProduto.nome,
            tipo: 'entrada',
            quantidade: data.quantidade,
            data: data.data_compra,
            origem: 'compra',
            observacoes: `Compra inicial - ${data.fornecedor || 'Fornecedor não informado'}`,
            created_by: data.created_by
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['compras'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
    } else if (item.type === 'create_venda') {
      const data = item.data;

      // Criar cliente automaticamente se não existir
      if (data.cliente && data.cliente.trim()) {
        const nomeCliente = data.cliente.trim();
        const clientesExistentes = await base44.entities.Cliente.filter({
          nome: nomeCliente,
          created_by: data.created_by
        });

        if (clientesExistentes.length === 0) {
          await base44.entities.Cliente.create({
            nome: nomeCliente,
            ativo: true,
            created_by: data.created_by
          });
        }
      }

      await base44.entities.Venda.create(data);

      if (data.descontar_estoque && data.produto_estoque_id) {
        const productData = await base44.entities.Produto.get(data.produto_estoque_id);
        if (productData && productData.controla_estoque) {
          const novoEstoque = Math.max(0, productData.estoque_atual - data.quantidade);
          await base44.entities.Produto.update(productData.id, { estoque_atual: novoEstoque });
          await base44.entities.MovimentacaoEstoque.create({
            produto_id: productData.id,
            produto_nome: productData.nome,
            tipo: 'saida',
            quantidade: data.quantidade,
            data: data.data_venda,
            origem: 'venda',
            observacoes: `Venda - ${data.cliente || 'Cliente não informado'}`,
            created_by: data.created_by
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    } else if (item.type === 'create_produto') {
      await base44.entities.Produto.create(item.data);
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    } else if (item.type === 'create_movimentacao') {
      await base44.entities.MovimentacaoEstoque.create(item.data);
      const productData = await base44.entities.Produto.get(item.data.produto_id);
      if (productData) {
        let novoEstoque = productData.estoque_atual;
        if (item.data.tipo === 'entrada') novoEstoque += item.data.quantidade;
        else if (item.data.tipo === 'saida' || item.data.tipo === 'perda') novoEstoque -= item.data.quantidade;
        else if (item.data.tipo === 'ajuste') novoEstoque = item.data.quantidade;
        await base44.entities.Produto.update(productData.id, { estoque_atual: Math.max(0, novoEstoque) });
      }
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
    } else if (item.type === 'create_gasto') {
      if (item.data.tipo === 'diaria_funcionario' && item.data.funcionario) {
        const nomeFuncionario = item.data.funcionario.trim();
        const funcionariosExistentes = await base44.entities.Funcionario.filter({
          nome: nomeFuncionario,
          created_by: item.data.created_by
        });
        if (funcionariosExistentes.length === 0) {
          await base44.entities.Funcionario.create({
            nome: nomeFuncionario,
            ativo: true,
            created_by: item.data.created_by
          });
        }
      }
      await base44.entities.GastoOperacional.create(item.data);
      queryClient.invalidateQueries({ queryKey: ['gastos-operacionais'] });
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    } else if (item.type === 'create_funcionario') {
      await base44.entities.Funcionario.create(item.data);
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    } else if (item.type === 'create_diaria') {
      const nomeFuncionario = item.data.funcionario_nome.trim();
      const funcionariosExistentes = await base44.entities.Funcionario.filter({
        nome: nomeFuncionario,
        created_by: item.data.created_by
      });

      let funcionarioId;
      if (funcionariosExistentes.length === 0) {
        const novoFuncionario = await base44.entities.Funcionario.create({
          nome: nomeFuncionario,
          ativo: true,
          created_by: item.data.created_by
        });
        funcionarioId = novoFuncionario.id;
      } else {
        funcionarioId = funcionariosExistentes[0].id;
      }

      await base44.entities.Diaria.create({
        ...item.data,
        funcionario_id: funcionarioId,
        created_by: item.data.created_by
      });

      queryClient.invalidateQueries({ queryKey: ['diarias'] });
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    }
  };

  const produtosComEstoqueBaixo = produtos.filter(
    p => p.ativo && p.estoque_atual <= p.estoque_minimo && p.estoque_minimo > 0
  );

  const produtosAtivos = produtos.filter(p => p.ativo);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <OfflineManager onSync={handleSync} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Controle</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Gerencie vendas, compras, estoque e pagamentos
          </p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
            <TrendingUp className="w-3 h-3" />
            {vendas.length} Vendas
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
            <ShoppingCart className="w-3 h-3" />
            {compras.length} Compras
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
            <Package className="w-3 h-3" />
            {produtosAtivos.length} Produtos
          </Badge>
          {produtosComEstoqueBaixo.length > 0 && (
            <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1 whitespace-nowrap">
              <AlertTriangle className="w-3 h-3" />
              {produtosComEstoqueBaixo.length} Baixo
            </Badge>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="vendas" className="text-xs md:text-sm py-2">
              <TrendingUp className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Vendas</span>
              <span className="sm:hidden">Venda</span>
            </TabsTrigger>
            <TabsTrigger value="compras" className="text-xs md:text-sm py-2">
              <ShoppingCart className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Compras</span>
              <span className="sm:hidden">Compra</span>
            </TabsTrigger>
            <TabsTrigger value="lanches" className="text-xs md:text-sm py-2">
              🍕
              <span className="hidden sm:inline ml-2">Lanches</span>
              <span className="sm:hidden ml-1">Lanch</span>
            </TabsTrigger>
            <TabsTrigger value="pagamentos" className="text-xs md:text-sm py-2">
              <DollarSign className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Pagamentos</span>
              <span className="sm:hidden">Pag</span>
            </TabsTrigger>
            <TabsTrigger value="estoque" className="text-xs md:text-sm py-2">
              <Package className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Estoque</span>
              <span className="sm:hidden">Estoq</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vendas" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold">Vendas</h2>
              <Button
                onClick={() => {
                  setEditandoVenda(null);
                  setShowFormVenda(!showFormVenda);
                }}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Venda
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {showFormVenda && (
                <FormVenda
                  key={editandoVenda?.id || 'nova'}
                  venda={editandoVenda}
                  produtos={produtosAtivos}
                  onSubmit={handleSubmitVenda}
                  onCancel={() => {
                    setShowFormVenda(false);
                    setEditandoVenda(null);
                  }}
                />
              )}
            </AnimatePresence>

            <ListaVendas
              vendas={vendas}
              loading={loadingVendas}
              onEditar={handleEditarVenda}
              onDeletar={handleDeletarVenda}
            />
          </TabsContent>

          <TabsContent value="compras" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold">Compras</h2>
              <Button
                onClick={() => {
                  setEditandoCompra(null);
                  setShowFormCompra(!showFormCompra);
                }}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Compra
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {showFormCompra && (
                <FormCompra
                  key={editandoCompra?.id || 'nova'}
                  compra={editandoCompra}
                  produtos={produtosAtivos}
                  onSubmit={handleSubmitCompra}
                  onCancel={() => {
                    setShowFormCompra(false);
                    setEditandoCompra(null);
                  }}
                />
              )}
            </AnimatePresence>

            <ListaCompras
              compras={compras}
              loading={loadingCompras}
              onEditar={handleEditarCompra}
              onDeletar={handleDeletarCompra}
            />
          </TabsContent>

          <TabsContent value="lanches" className="space-y-6">
            <Tabs value={lanchesTab} onValueChange={setLanchesTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
                <TabsTrigger value="receitas">Receitas</TabsTrigger>
                <TabsTrigger value="ingredientes">Ingredientes</TabsTrigger>
                <TabsTrigger value="config">Config</TabsTrigger>
              </TabsList>

              <TabsContent value="pedidos" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-lg md:text-xl font-bold">Pedidos</h2>
                  <Button
                    onClick={() => setShowFormPedido(!showFormPedido)}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Pedido
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {showFormPedido && (
                    <FormPedido
                      key="novo-pedido"
                      receitas={receitas}
                      produtos={produtos}
                      ingredientes={ingredientes}
                      onSubmit={handleSubmitPedido}
                      onCancel={() => setShowFormPedido(false)}
                    />
                  )}
                </AnimatePresence>

                <ListaPedidos
                  pedidos={pedidos}
                  loading={loadingPedidos}
                  onDeletar={handleDeletarPedido}
                  onAtualizarStatus={handleAtualizarStatusPedido}
                  diasAlertaPendente={diasAlertaPedido}
                />
              </TabsContent>

              <TabsContent value="receitas" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-lg md:text-xl font-bold">Receitas de Produtos</h2>
                  <Button
                    onClick={() => {
                      setEditandoReceita(null);
                      setShowFormReceita(!showFormReceita);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Receita
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {showFormReceita && (
                    <FormReceita
                      key={editandoReceita?.id || 'nova'}
                      receita={editandoReceita}
                      ingredientes={ingredientes}
                      onSubmit={handleSubmitReceita}
                      onCancel={() => {
                        setShowFormReceita(false);
                        setEditandoReceita(null);
                      }}
                    />
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {showFormProducao && receitaProduzir && (
                    <FormProducao
                      key={receitaProduzir.id}
                      receita={receitaProduzir}
                      ingredientes={ingredientes}
                      onSubmit={handleSubmitProducao}
                      onCancel={() => {
                        setShowFormProducao(false);
                        setReceitaProduzir(null);
                      }}
                    />
                  )}
                </AnimatePresence>

                <ListaReceitas
                  receitas={receitas}
                  loading={loadingReceitas}
                  onEditar={handleEditarReceita}
                  onDeletar={handleDeletarReceita}
                  onProduzir={handleProduzir}
                />
              </TabsContent>

              <TabsContent value="ingredientes" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-lg md:text-xl font-bold">Ingredientes</h2>
                  <Button
                    onClick={() => {
                      setEditandoIngrediente(null);
                      setShowFormIngrediente(!showFormIngrediente);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Ingrediente
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {showFormIngrediente && (
                    <FormIngrediente
                      key={editandoIngrediente?.id || 'novo'}
                      ingrediente={editandoIngrediente}
                      onSubmit={handleSubmitIngrediente}
                      onCancel={() => {
                        setShowFormIngrediente(false);
                        setEditandoIngrediente(null);
                      }}
                    />
                  )}
                </AnimatePresence>

                <ListaIngredientes
                  ingredientes={ingredientes}
                  loading={loadingIngredientes}
                  onEditar={handleEditarIngrediente}
                  onDeletar={handleDeletarIngrediente}
                />
              </TabsContent>

              <TabsContent value="config" className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Configurações de Lanches</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Margem de Lucro Padrão (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue={user?.margem_lucro_padrao || 30}
                        onBlur={async (e) => {
                          try {
                            await base44.auth.updateMe({
                              margem_lucro_padrao: parseFloat(e.target.value) || 30
                            });
                            alert('✅ Margem padrão salva!');
                          } catch (error) {
                            console.error('Erro ao salvar:', error);
                          }
                        }}
                        placeholder="30"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Esta margem será usada automaticamente ao criar novas receitas.
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-4">
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-3">🔔 Alertas de Custo</h4>
                        <Label>Alerta de Aumento de Custo (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          defaultValue={user?.limite_aumento_custo_receita || 15}
                          onBlur={async (e) => {
                            try {
                              await base44.auth.updateMe({
                                limite_aumento_custo_receita: parseFloat(e.target.value) || 15
                              });
                              alert('✅ Limite de alerta salvo!');
                            } catch (error) {
                              console.error('Erro ao salvar:', error);
                            }
                          }}
                          placeholder="15"
                        />
                        <p className="text-sm text-yellow-700 mt-2">
                          Você será alertado quando o custo de uma receita aumentar mais que esta porcentagem ao atualizar ingredientes.
                        </p>
                      </div>

                      <div className="border-t border-yellow-300 pt-4">
                        <h4 className="font-semibold text-yellow-900 mb-3">⏰ Alertas de Pedidos</h4>
                        <Label>Alerta de Pedido Pendente (dias)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={diasAlertaPedido}
                          onChange={(e) => setDiasAlertaPedido(parseInt(e.target.value) || 3)}
                          onBlur={async (e) => {
                            try {
                              await base44.auth.updateMe({
                                dias_alerta_pedido_pendente: parseInt(e.target.value) || 3
                              });
                              alert('✅ Alerta de pedidos salvo!');
                            } catch (error) {
                              console.error('Erro ao salvar:', error);
                            }
                          }}
                          placeholder="3"
                        />
                        <p className="text-sm text-yellow-700 mt-2">
                          Pedidos pendentes há mais de {diasAlertaPedido} dias serão destacados com um alerta.
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">💡 Dica</h4>
                      <p className="text-sm text-blue-800">
                        Para cálculo avançado com <strong>Markup</strong> baseado em custos fixos e variáveis, 
                        vá em <strong>Configurações → Markup</strong> no menu principal.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="pagamentos" className="space-y-6">
            <Tabs value={pagamentosTab} onValueChange={setPagamentosTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="calendario">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Calendário</span>
                  <span className="md:hidden">Cal</span>
                </TabsTrigger>
                <TabsTrigger value="receber_pagar">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">A Receber/Pagar</span>
                  <span className="md:hidden">R/P</span>
                </TabsTrigger>
                <TabsTrigger value="gastos">
                  <Receipt className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Gastos</span>
                  <span className="md:hidden">Gasto</span>
                </TabsTrigger>
                <TabsTrigger value="funcionarios">
                  <UsersIcon className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Funcionários</span>
                  <span className="md:hidden">Func</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendario">
                <CalendarioControle vendas={vendas} compras={compras} />
              </TabsContent>

              <TabsContent value="receber_pagar">
                <PagamentosControle vendas={vendas} compras={compras} />
              </TabsContent>

              <TabsContent value="gastos" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-lg md:text-xl font-bold">Gastos Operacionais</h2>
                  <Button
                    onClick={() => {
                      setEditandoGasto(null);
                      setShowFormGasto(!showFormGasto);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Gasto
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {showFormGasto && (
                    <FormGasto
                      key={editandoGasto?.id || 'novo'}
                      gasto={editandoGasto}
                      onSubmit={handleSubmitGasto}
                      onCancel={() => {
                        setShowFormGasto(false);
                        setEditandoGasto(null);
                      }}
                    />
                  )}
                </AnimatePresence>

                <ListaGastos
                  gastos={gastos}
                  loading={loadingGastos}
                  onEditar={handleEditarGasto}
                  onDeletar={handleDeletarGasto}
                />
              </TabsContent>

              <TabsContent value="funcionarios" className="space-y-6">
                <Tabs value={funcionariosTab} onValueChange={setFuncionariosTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="diarias">Diárias</TabsTrigger>
                    <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
                  </TabsList>

                  <TabsContent value="diarias" className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <h2 className="text-lg md:text-xl font-bold">Diárias</h2>
                      <Button
                        onClick={() => {
                          setEditandoDiaria(null);
                          setShowFormDiaria(!showFormDiaria);
                        }}
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Diária
                      </Button>
                    </div>

                    <AnimatePresence mode="wait">
                      {showFormDiaria && (
                        <FormDiaria
                          key={editandoDiaria?.id || 'nova'}
                          diaria={editandoDiaria}
                          funcionarios={funcionarios}
                          onSubmit={handleSubmitDiaria}
                          onCancel={() => {
                            setShowFormDiaria(false);
                            setEditandoDiaria(null);
                          }}
                        />
                      )}
                    </AnimatePresence>

                    <ListaDiarias
                      diarias={diarias}
                      loading={loadingDiarias}
                      onEditar={handleEditarDiaria}
                      onDeletar={handleDeletarDiaria}
                      onMarcarPago={handleMarcarDiariaPaga}
                    />
                  </TabsContent>

                  <TabsContent value="funcionarios" className="space-y-6">
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Dica:</strong> Funcionários são criados automaticamente ao registrar uma diária ou gasto de funcionário. Use esta aba para adicionar telefone e observações.
                      </p>
                    </div>

                    <AnimatePresence mode="wait">
                      {showFormFuncionario && (
                        <FormFuncionario
                          key={editandoFuncionario?.id || 'novo'}
                          funcionario={editandoFuncionario}
                          onSubmit={handleSubmitFuncionario}
                          onCancel={() => {
                            setShowFormFuncionario(false);
                            setEditandoFuncionario(null);
                          }}
                        />
                      )}
                    </AnimatePresence>

                    <ListaFuncionarios
                      funcionarios={funcionarios}
                      loading={loadingFuncionarios}
                      onEditar={handleEditarFuncionario}
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="estoque" className="space-y-6">
            <NotificationManager produtos={produtos} />

            {produtosComEstoqueBaixo.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900">
                      {produtosComEstoqueBaixo.length} produto(s) com estoque baixo
                    </h3>
                    <div className="mt-2 space-y-1">
                      {produtosComEstoqueBaixo.slice(0, 3).map(p => (
                        <p key={p.id} className="text-sm text-orange-700">
                          • {p.nome}: {p.estoque_atual} {p.unidade}
                        </p>
                      ))}
                      {produtosComEstoqueBaixo.length > 3 && (
                        <p className="text-sm text-orange-700">
                          + {produtosComEstoqueBaixo.length - 3} outros
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <ResumoEstoque produtos={produtos} movimentacoes={movimentacoes} />

            <Tabs value={estoqueTab} onValueChange={setEstoqueTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="produtos">Produtos</TabsTrigger>
                <TabsTrigger value="alertas">Alertas</TabsTrigger>
                <TabsTrigger value="sugestoes">Sugestões</TabsTrigger>
                <TabsTrigger value="lotes">Lotes</TabsTrigger>
                <TabsTrigger value="fornecedores">Fornec.</TabsTrigger>
              </TabsList>

              <TabsContent value="produtos" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-lg md:text-xl font-bold">Produtos</h2>
                  <Button
                    onClick={() => {
                      setEditandoProduto(null);
                      setShowFormProduto(!showFormProduto);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Produto
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {showFormProduto && (
                    <FormProduto
                      key={editandoProduto?.id || 'nova'}
                      produto={editandoProduto}
                      onSubmit={handleSubmitProduto}
                      onCancel={() => {
                        setShowFormProduto(false);
                        setEditandoProduto(null);
                      }}
                    />
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {showFormMovimentacao && produtoSelecionado && (
                    <FormMovimentacao
                      key={produtoSelecionado?.id || 'nova'}
                      produto={produtoSelecionado}
                      onSubmit={handleSubmitMovimentacao}
                      onCancel={() => {
                        setShowFormMovimentacao(false);
                        setProdutoSelecionado(null);
                      }}
                    />
                  )}
                </AnimatePresence>

                <ListaProdutos
                  produtos={produtos}
                  loading={loadingProdutos}
                  onEditar={handleEditarProduto}
                  onAdicionarEntrada={(p) => handleAdicionarMovimentacao(p, 'entrada')}
                  onAdicionarSaida={(p) => handleAdicionarMovimentacao(p, 'saida')}
                />
              </TabsContent>

              <TabsContent value="alertas" className="space-y-6">
                <AlertasInteligentes />
              </TabsContent>

              <TabsContent value="sugestoes" className="space-y-6">
                <SugestaoCompras />
              </TabsContent>

              <TabsContent value="lotes" className="space-y-6">
                <GerenciadorLotes />
              </TabsContent>

              <TabsContent value="fornecedores" className="space-y-6">
                <GerenciadorFornecedores />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Novo menu para Relatórios de Giro */}
        {activeTab === 'estoque' && estoqueTab === 'produtos' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>📊 Análise de Giro de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <RelatorioGiroEstoque />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}