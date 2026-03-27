
import React from 'react';

export default function PoliticaDePrivacidade() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Política de Privacidade</h1>
        <p className="text-gray-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p>
            Bem-vindo ao aplicativo <strong>Lucro Certo</strong>. Sua privacidade é muito importante para nós. Esta política de privacidade explica como coletamos, usamos e protegemos suas informações quando você utiliza nosso aplicativo.
          </p>

          <h2>1. Informações que Coletamos</h2>
          <p>Coletamos as seguintes categorias de informações:</p>
          <ul>
            <li>
              <strong>Informações de Conta:</strong> Ao se registrar utilizando sua conta Google, coletamos seu nome completo e endereço de e-mail para criar e gerenciar sua conta de forma segura.
            </li>
            <li>
              <strong>Dados Financeiros Inseridos por Você:</strong> Todas as informações que você voluntariamente insere no aplicativo para utilizar suas funcionalidades, como registros de Compras, Vendas, Gastos Operacionais e Gastos Pessoais.
            </li>
          </ul>

          <h2>2. Como Usamos Suas Informações</h2>
          <p>Utilizamos as informações coletadas exclusivamente para:</p>
          <ul>
            <li>Fornecer, operar e manter a funcionalidade principal do aplicativo.</li>
            <li>Personalizar sua experiência e identificar você como o único proprietário dos seus dados.</li>
            <li>Gerar os relatórios e cálculos financeiros que o aplicativo oferece.</li>
            <li>Garantir a segurança da sua conta e prevenir acessos não autorizados.</li>
          </ul>

          <h2>3. Compartilhamento de Informações</h2>
          <p>
            <strong>Nós não vendemos, alugamos ou compartilhamos suas informações pessoais ou financeiras com terceiros.</strong> Seus dados são privados e acessíveis apenas por você através do seu login seguro.
          </p>

          <h2>4. Segurança dos Dados</h2>
          <p>
            Empregamos medidas de segurança padrão da indústria para proteger suas informações contra acesso, alteração ou destruição não autorizada. Seus dados são armazenados em infraestrutura de nuvem segura.
          </p>

          <h2>5. Seus Direitos</h2>
          <p>
            Você tem total controle sobre seus dados. A qualquer momento, você pode acessar, editar e excluir os dados financeiros que inseriu diretamente através da interface do aplicativo.
          </p>

          <h2>6. Alterações a Esta Política</h2>
          <p>
            Podemos atualizar nossa Política de Privacidade de tempos em tempos. Recomendamos que você revise esta página periodicamente para quaisquer alterações.
          </p>
        </div>
      </div>
    </div>
  );
}
