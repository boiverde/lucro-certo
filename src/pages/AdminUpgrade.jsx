import React, { useState } from 'react';
import { httpClient } from '@/api/httpClient';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserCheck, ShieldAlert } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function AdminUpgrade() {
    const [email, setEmail] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setUser(null);
        try {
            const data = await httpClient(`/admin/users/search?email=${email}`);
            setUser(data);
        } catch (error) {
            toast({
                title: "Usuário não encontrado",
                description: "Verifique o email digitado.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async () => {
        if (!user) return;

        setUpdating(true);
        try {
            await httpClient(`/admin/users/${user.id}/plan`, {
                method: 'PATCH',
                body: JSON.stringify({ plan: 'pro' })
            });

            toast({
                title: "Plano Atualizado",
                description: `O usuário ${user.email} agora é PRO.`,
            });
            
            // Atualizar estado local
            setUser({ ...user, plan: 'pro' });
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao atualizar",
                description: "Não foi possível alterar o plano.",
                variant: "destructive"
            });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-indigo-500" />
                Painel Administrativo
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>Ativação Manual do Plano Pro</CardTitle>
                    <CardDescription>Busque usuários pelo email cadastrado para alterar o plano.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input 
                            placeholder="Email do usuário" 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? "Buscando..." : <Search className="w-4 h-4" />}
                        </Button>
                    </form>

                    {user && (
                        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-sm text-slate-500">Usuário encontrado:</p>
                                    <h3 className="text-xl font-bold">{user.name}</h3>
                                    <p className="text-slate-600">{user.email}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.plan === 'pro' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                    Plano {user.plan}
                                </div>
                            </div>

                            {user.plan === 'free' ? (
                                <Button 
                                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                                    onClick={handleUpgrade}
                                    disabled={updating}
                                >
                                    {updating ? "Ativando..." : "Ativar Plano Pro"}
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2 text-green-600 font-semibold justify-center">
                                    <UserCheck className="w-5 h-5" />
                                    Usuário já é PRO
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
