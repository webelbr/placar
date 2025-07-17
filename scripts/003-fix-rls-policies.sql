-- Corrigir políticas RLS para permitir deleção

-- Remover políticas existentes
DROP POLICY IF EXISTS "Allow public read access" ON tournaments;
DROP POLICY IF EXISTS "Allow public insert" ON tournaments;
DROP POLICY IF EXISTS "Allow public update" ON tournaments;
DROP POLICY IF EXISTS "Allow public read access" ON teams;
DROP POLICY IF EXISTS "Allow public insert" ON teams;
DROP POLICY IF EXISTS "Allow public update" ON teams;
DROP POLICY IF EXISTS "Allow public read access" ON matches;
DROP POLICY IF EXISTS "Allow public insert" ON matches;
DROP POLICY IF EXISTS "Allow public update" ON matches;

-- Criar políticas mais permissivas para desenvolvimento
CREATE POLICY "Allow all operations on tournaments" ON tournaments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on teams" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on matches" ON matches FOR ALL USING (true) WITH CHECK (true);
