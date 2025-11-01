# FOTO MAGIA IA - Módulo de Transformação Inteligente de Ambientes

## 📋 Visão Geral

O **FOTO MAGIA IA** é um módulo avançado integrado ao projeto JP Marcenaria Digital que utiliza inteligência artificial e visão computacional para transformar digitalmente ambientes, especialmente cozinhas, permitindo aos clientes visualizar diferentes estilos e adaptações antes da execução do projeto.

## 🚀 Funcionalidades Principais

### 1. **Upload e Análise de Imagens**
- Interface intuitiva para upload de múltiplas imagens
- Suporte a formatos: JPG, PNG, WebP
- Análise automática de perspectiva e objetos
- Detecção de elementos arquitetônicos

### 2. **Transformação de Estilos**
- **Moderno**: Linhas limpas, cores neutras, acabamentos minimalistas
- **Rústico**: Madeira natural, texturas orgânicas, tons terrosos
- **Industrial**: Metais expostos, concreto, tubulações aparentes
- **Clássico**: Elegância atemporal, detalhes refinados
- **Escandinavo**: Simplicidade, funcionalidade, tons claros
- **Contemporâneo**: Tendências atuais, tecnologia integrada

### 3. **Visualização Avançada**
- **Modo 2D**: Comparação lado a lado (original vs transformada)
- **Modo 3D**: Visualização tridimensional com controles interativos
- **Modo AR**: Realidade aumentada (quando suportado pelo dispositivo)

### 4. **Ajustes Manuais**
- Controles de imagem: brilho, contraste, saturação, matiz
- Gerenciamento de camadas com opacidade e modos de mesclagem
- Presets predefinidos: vívido, quente, frio, dramático, suave, natural
- Histórico de ações com desfazer/refazer

### 5. **Exportação e Compartilhamento**
- Múltiplos formatos: PNG, JPG, WebP, PDF
- Controle de qualidade e resolução
- Opção de marca d'água personalizada
- Compartilhamento direto e impressão

## 🛠️ Arquitetura Técnica

### Componentes Principais

#### 1. **FotoMagiaIA.tsx** (Página Principal)
- Gerenciamento de estado da aplicação
- Navegação por etapas (upload → estilo → processamento → resultados)
- Integração com todos os sub-componentes

#### 2. **fotoMagiaAPI.ts** (API de Processamento)
- Interface com API Nano Banana
- Algoritmos de análise de imagem
- Transformação de estilos
- Processamento em lote

#### 3. **computerVision.ts** (Visão Computacional)
- Detecção de objetos usando algoritmo Canny
- Análise de perspectiva com transformada de Hough
- Cálculo de pontos de fuga e linha do horizonte
- Adaptação de móveis para novas perspectivas

#### 4. **AR3DViewer.tsx** (Visualização 3D/AR)
- Renderização 3D simulada
- Controles de rotação, zoom e iluminação
- Verificação de suporte WebXR para AR
- Interface responsiva para diferentes dispositivos

#### 5. **ManualAdjustments.tsx** (Ajustes Manuais)
- Controles deslizantes para ajustes de imagem
- Sistema de camadas avançado
- Presets e histórico de ações
- Opções de exportação personalizadas

## 🔧 Tecnologias Utilizadas

- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Radix UI** para componentes base
- **Lucide React** para ícones
- **Canvas API** para processamento de imagem
- **WebXR API** para realidade aumentada
- **File API** para manipulação de arquivos

## 📱 Compatibilidade

### Desktop
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Mobile
- ✅ iOS Safari 14+
- ✅ Chrome Mobile 90+
- ✅ Samsung Internet 14+

### Recursos Avançados
- **WebXR (AR)**: Chrome 79+, Edge 79+
- **Canvas 2D**: Todos os navegadores modernos
- **File API**: Suporte universal

## 🚀 Como Usar

### 1. Acesso ao Módulo
```
URL: /foto-magia-ia
Navegação: Menu principal → "FOTO MAGIA IA"
```

### 2. Fluxo de Trabalho
1. **Upload**: Selecione uma ou mais imagens da cozinha
2. **Estilo**: Escolha o estilo desejado para transformação
3. **Processamento**: Aguarde a análise e transformação da IA
4. **Resultados**: Visualize, ajuste e exporte os resultados

### 3. Dicas de Uso
- Use imagens com boa iluminação para melhores resultados
- Prefira ângulos que mostrem a cozinha completa
- Experimente diferentes estilos para comparar opções
- Utilize os ajustes manuais para personalizar o resultado

## 🔮 Funcionalidades Futuras

### Versão 2.0 (Planejada)
- [ ] Integração real com API Nano Banana
- [ ] Detecção de objetos com machine learning
- [ ] Realidade aumentada nativa
- [ ] Catálogo de móveis JP Marcenaria
- [ ] Orçamento automático baseado na transformação

### Versão 3.0 (Roadmap)
- [ ] IA generativa para criação de ambientes
- [ ] Simulação de iluminação realística
- [ ] Integração com ferramentas CAD
- [ ] Colaboração em tempo real
- [ ] Aplicativo mobile dedicado

## 📊 Métricas e Analytics

O módulo coleta métricas de uso para melhorias contínuas:
- Tempo de processamento por imagem
- Estilos mais populares
- Taxa de conversão (visualização → orçamento)
- Satisfação do usuário

## 🔒 Segurança e Privacidade

- Imagens processadas localmente quando possível
- Dados temporários removidos após sessão
- Conformidade com LGPD
- Criptografia de dados em trânsito

## 📞 Suporte

Para dúvidas ou problemas com o módulo FOTO MAGIA IA:
- **Email**: suporte@jpmarcenaria.com.br
- **WhatsApp**: (13) 97414-6380
- **Documentação**: Este arquivo
- **Issues**: GitHub do projeto

---

**Desenvolvido com ❤️ pela equipe JP Marcenaria Digital**
*Transformando sonhos em realidade através da tecnologia*