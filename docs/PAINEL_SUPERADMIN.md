# Painel do superadmin

O superadmin gerencia a plataforma inteira. É um perfil diferente do dono de empresa: ao entrar, ele cai direto em `/admin`, com o menu lateral **Superadmin**, sem o cabeçalho e o rodapé do site.

## O que ele gerencia

| Menu | O que dá para fazer |
| --- | --- |
| **Visão geral** | Alerta de empresas esperando aprovação, números de pessoas, empresas, publicações e seleções, vaga sem empresa e últimos cadastros. Cada número abre a lista correspondente. |
| **Empresas** | Busca por nome, CNPJ, cidade ou dono. Filtros: pendentes, ativas, suspensas. **Aprovar**, **Suspender**, **Verificar**, abrir os **Dados** e **Excluir**. |
| **Usuários** | Todos os perfis (candidatos, autônomos, donos de empresa, superadmins). Busca por nome ou e-mail. **Redefinir senha**, **Desativar/Ativar**, **Tornar/Tirar superadmin**, **Excluir**. |
| **Vagas** | Todas as vagas de todas as empresas. **Publicar**, **Pausar**, **Encerrar**, **Destacar**, **Ver no site**, **Excluir**. Mostra modalidade, empresa e quantas candidaturas recebeu. |
| **Autônomos** | Perfis de profissionais no site. **Pausar/Ativar**, **Destacar**, **Ver no site**, **Excluir** o perfil. |
| **Seleções** | Todos os processos de seleção e contratação (somente leitura): etapas, conversa e documentos. Quem conduz são empresa e candidato. |
| **Planos** e **ADS** | Planos exibidos na página Planos (ativar/desativar) e destaques pagos cadastrados. |
| **Páginas do site** | Montar e editar páginas em seções (ver [`PAGINAS.md`](PAGINAS.md)). |
| **Categorias** | Áreas de vagas e de autônomos, segmentos de empresa e modalidade da vaga (presencial, remota, híbrida). |

## Proteções

- Quem está logado no app **não consegue se tornar superadmin** nem se auto-verificar: o banco desfaz essa alteração.
- A própria conta não pode se desativar, se apagar nem tirar o próprio acesso. O banco também impede remover ou apagar o **último** superadmin.
- Superadmin e dono de empresa são perfis separados. Quem tem os dois entra no `/admin` e troca de painel pelo seletor do menu.
- Se alguém abre um endereço de um painel que não tem, é levado ao painel que tem (o superadmin vai para `/admin`).

## Dar o acesso de superadmin

- **Pelo painel:** em **Usuários**, **Tornar superadmin** (pede confirmação).
- **Pelo Supabase (primeiro superadmin):** no SQL Editor,

  ```sql
  update public.profiles set is_admin = true where email = 'seu-email@exemplo.com';
  ```

  Isso só funciona depois da migration `0027_superadmin_access.sql`. Antes dela, a trava de segurança desfazia a alteração em silêncio.
- Para conferir: `select email, is_admin from public.profiles where is_admin;`

## Conta de demonstração

`admin@empregasantana-seed.com` (senha de demonstração em `docs/PRD.md`). A migration 0027 garante que ela tenha a marca de superadmin. **Troque a senha ou apague a conta antes de lançar de verdade**: a senha está escrita no repositório.
