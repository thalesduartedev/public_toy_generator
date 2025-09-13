// Character Creator JavaScript - Versão Melhorada com Upload

class CharacterCreatorImproved {
  constructor() {
    this.canvas1 = document.getElementById("characterCanvas1");
    this.canvas2 = document.getElementById("characterCanvas2");

    if (!this.canvas1 || !this.canvas2) {
      console.error("Canvas não encontrados!");
      return;
    }

    this.ctx1 = this.canvas1.getContext("2d");
    this.ctx2 = this.canvas2.getContext("2d");

    // Configurações
    this.spriteSize = 32;
    this.canvasSize = 64;

    // Estado dos personagens (um para cada frame)
    this.frame1Character = {};
    this.frame2Character = {};

    // Frame atualmente selecionado para edição
    this.currentFrame = 1;

    // Estado da interface
    this.currentCategory = null;
    this.availableItems = {};
    this.categories = ["armatraseira","corpo", "olhos", "cabelo", "bandana", "roupa", "calca", "arma", "chapeu"];
    this.isAnimating = false;
    this.animationInterval = null;

    // Propriedades CSS personalizáveis para cada item individualmente
    this.cssProperties = {};

    // Upload de novos itens
    this.uploadedItems = {};
    this.previewImage = null;
    this.previewPosition = { x: 0, y: 0 };
    this.previewCanvas = null;
    this.previewCtx = null;
    this.backgroundColorHex = "#ff6b9d";

    this.init();
  }

  async init() {
    // Inicializar canvas de preview
    this.previewCanvas = document.getElementById("previewCanvas");
    if (this.previewCanvas) {
      this.previewCtx = this.previewCanvas.getContext("2d");
      this.previewCtx.imageSmoothingEnabled = false;
    }

    // Carregar sprites automaticamente
    await this.loadAvailableSprites();

    // Configurar event listeners
    this.setupEventListeners();

    // Configurar interface inicial
    if (this.categories.length > 0) {
      this.currentCategory = this.categories[0];
      this.updateCategoryTabs();
      this.updateItemsGrid();
    }

    // Renderizar personagens iniciais (vazios)
    this.renderCharacter();
  }

  async loadAvailableSprites() {
    this.availableItems = {};

    for (const category of this.categories) {
      this.availableItems[category] = [];
      
      try {
        // Tentar carregar arquivos da pasta
        const response = await fetch(`sprites/${category}/`);
        if (response.ok) {
          const html = await response.text();
          
          // Extrair nomes de arquivos PNG da listagem do diretório
          const pngFiles = html.match(/href="[^"]*\.png"/g);
          
          if (pngFiles) {
            pngFiles.forEach(match => {
              const filename = match.replace(/href="|"/g, "");
              if (filename !== "../") {
                const name = this.formatItemName(filename);
                this.availableItems[category].push({
                  name: name,
                  filename: filename,
                  path: `sprites/${category}/${filename}`
                });
              }
            });
          }
        }
      } catch (error) {
        console.warn(`Não foi possível carregar automaticamente a categoria ${category}:`, error);
        
        // Fallback para itens conhecidos
        this.loadFallbackItems(category);
      }

      // Adicionar itens uploadados se existirem
      if (this.uploadedItems[category]) {
        this.availableItems[category].push(...this.uploadedItems[category]);
      }

      // Inicializar estado dos personagens
      this.frame1Character[category] = null;
      this.frame2Character[category] = null;
    }
  }

  formatItemName(filename) {
    // Converter nome do arquivo em nome legível
    return filename
      .replace(/\.(png|jpg|jpeg)$/i, "") // Remove extensão
      .replace(/[_-]/g, " ") // Substitui _ e - por espaços
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitaliza primeira letra de cada palavra
  }

  loadFallbackItems(category) {
    // Itens de fallback caso não consiga carregar automaticamente
    const fallbackItems = {
      corpo: [
        { name: "Corpo 5", filename: "rosto_5.png", path: "sprites/rosto/rosto_5.png" },
        { name: "Corpo 11", filename: "rosto_11.png", path: "sprites/rosto/rosto_11.png" },
        { name: "Corpo 3", filename: "rosto_3.png", path: "sprites/rosto/rosto_3.png" },
        { name: "Corpo 12", filename: "rosto_12.png", path: "sprites/rosto/rosto_12.png" },
        { name: "Corpo 4", filename: "rosto_4.png", path: "sprites/rosto/rosto_4.png" },
        { name: "Corpo 1", filename: "rosto_1.png", path: "sprites/rosto/rosto_1.png" },
        { name: "Corpo 7", filename: "rosto_7.png", path: "sprites/rosto/rosto_7.png" },
        { name: "Corpo 2", filename: "rosto_2.png", path: "sprites/rosto/rosto_2.png" },
        { name: "Corpo 6", filename: "rosto_6.png", path: "sprites/rosto/rosto_6.png" },
        { name: "Corpo 8", filename: "rosto_8.png", path: "sprites/rosto/rosto_8.png" },
        { name: "Corpo 9", filename: "rosto_9.png", path: "sprites/rosto/rosto_9.png" },
        { name: "Corpo 10", filename: "rosto_10.png", path: "sprites/rosto/rosto_10.png" },
        { name: "Corpo 13", filename: "rosto_13.png", path: "sprites/rosto/rosto_13.png" },
      ],
      olhos: [
        { name: "Nada", filename: "nada.png", path: "sprites/olhos/nada.png" },
        { name: "Olho Fechados", filename: "olhos_fechados.png", path: "sprites/olhos/olhos_fechados.png" },
        { name: "Olho Vermelho", filename: "eye_preserve_white_01.png", path: "sprites/olhos/eye_preserve_white_01.png" },
        { name: "Olho Verde", filename: "eye_preserve_white_02.png", path: "sprites/olhos/eye_preserve_white_02.png" },
        { name: "Olho Azul Oceano", filename: "eye_preserve_white_03.png", path: "sprites/olhos/eye_preserve_white_03.png" },
        { name: "Olho Amarelo", filename: "eye_preserve_white_04.png", path: "sprites/olhos/eye_preserve_white_04.png" },
        { name: "Olho Rosa", filename: "eye_preserve_white_05.png", path: "sprites/olhos/eye_preserve_white_05.png" },
        { name: "Olho Cyano", filename: "eye_preserve_white_06.png", path: "sprites/olhos/eye_preserve_white_06.png" },
        { name: "Olho Laranja", filename: "eye_preserve_white_07.png", path: "sprites/olhos/eye_preserve_white_07.png" },
        { name: "Olho Roxo", filename: "eye_preserve_white_08.png", path: "sprites/olhos/eye_preserve_white_08.png" },
        { name: "Olho Verde Esmeralda", filename: "eye_preserve_white_09.png", path: "sprites/olhos/eye_preserve_white_09.png" },
        { name: "Olho Verde Lima", filename: "eye_preserve_white_10.png", path: "sprites/olhos/eye_preserve_white_10.png" },
        { name: "Olho Azul Escuro", filename: "eye_preserve_white_11.png", path: "sprites/olhos/eye_preserve_white_11.png" },
        { name: "Olho Magenta", filename: "eye_preserve_white_12.png", path: "sprites/olhos/eye_preserve_white_12.png" },
        { name: "Olho Castanho Marrom", filename: "eye_preserve_white_13.png", path: "sprites/olhos/eye_preserve_white_13.png" },
        { name: "Olho Dourado", filename: "eye_preserve_white_14.png", path: "sprites/olhos/eye_preserve_white_14.png" },
        { name: "Olho Prata", filename: "eye_preserve_white_15.png", path: "sprites/olhos/eye_preserve_white_15.png" },
        { name: "Olho Preto", filename: "eye_preserve_white_16.png", path: "sprites/olhos/eye_preserve_white_16.png" },
        { name: "Olho Fechado", filename: "olhos_fechados.png", path: "sprites/olhos/olhos_fechados.png" },
        { name: "Sharingan", filename: "sharingan_normal.png", path: "sprites/olhos/sharingan_normal.png" },
        { name: "Sharingan 1", filename: "sharingan.png", path: "sprites/olhos/sharingan.png" },
        { name: "Sharingan 2", filename: "sharingan1.png", path: "sprites/olhos/sharingan1.png" },
        { name: "Sharingan 3", filename: "sharingan2.png", path: "sprites/olhos/sharingan2.png" },
        { name: "Sharingan 4", filename: "sharingan3.png", path: "sprites/olhos/sharingan3.png" },
        { name: "Rinnegan", filename: "rinnegan.png", path: "sprites/olhos/rinnegan.png" },
        { name: "Lee Eye", filename: "lee.png", path: "sprites/olhos/lee.png" },
        { name: "Kisame Eye", filename: "kisame_eye.png", path: "sprites/olhos/kisame_eye.png" },
        { name: "Kakuzu Eye", filename: "kakuzu.png", path: "sprites/olhos/kakuzu.png" },
        { name: "Byakugan Eye", filename: "byakugan.png", path: "sprites/olhos/byakugan.png" },
        { name: "Rispidos Eye", filename: "olhos_rispidos.png", path: "sprites/olhos/olhos_rispidos.png" },
      ],
      cabelo: [
        { name: "Nada", filename: "nada.png", path: "sprites/cabelo/nada.png" },
        { name: "Naruto Hair", filename: "cabelo_1.png", path: "sprites/cabelo/cabelo_1.png" },
        { name: "Sakura Hair", filename: "cabelo_2.png", path: "sprites/cabelo/cabelo_2.png" },
        { name: "Sasuke Hair", filename: "cabelo_3.png", path: "sprites/cabelo/cabelo_3.png" },
        { name: "Shikamaru Hair", filename: "cabelo_4.png", path: "sprites/cabelo/cabelo_4.png" },
        { name: "Sasuke v1 Hair", filename: "cabelo_5.png", path: "sprites/cabelo/cabelo_5.png" },
        { name: "Kakashi Hair", filename: "cabelo_6.png", path: "sprites/cabelo/cabelo_6.png" },
        { name: "Naruto Kyuubi Hair", filename: "cabelo_7.png", path: "sprites/cabelo/cabelo_7.png" },
        { name: "Lee Hair", filename: "cabelo_8.png", path: "sprites/cabelo/cabelo_8.png" },
        { name: "Itachi Hair", filename: "cabelo_9.png", path: "sprites/cabelo/cabelo_9.png" },
        { name: "Gaara Hair", filename: "cabelo_10.png", path: "sprites/cabelo/cabelo_10.png" },
        { name: "Minato Hair", filename: "cabelo_11.png", path: "sprites/cabelo/cabelo_11.png" },
        { name: "Hinata Hair", filename: "cabelo_12.png", path: "sprites/cabelo/cabelo_12.png" },
        { name: "Madara Hair", filename: "cabelo_13.png", path: "sprites/cabelo/cabelo_13.png" },
        { name: "Haku Hair", filename: "cabelo_14.png", path: "sprites/cabelo/cabelo_14.png" },
        { name: "Itachi Hair", filename: "cabelo_15.png", path: "sprites/cabelo/cabelo_15.png" },
        { name: "Sakura Hair", filename: "cabelo_16.png", path: "sprites/cabelo/cabelo_16.png" },
        { name: "Lee Hair", filename: "cabelo_17.png", path: "sprites/cabelo/cabelo_17.png" },
        { name: "Kisame Hair", filename: "cabelo_18.png", path: "sprites/cabelo/cabelo_18.png" },
        { name: "Deidara Hair", filename: "cabelo_19.png", path: "sprites/cabelo/cabelo_19.png" },
        { name: "Konan Hair", filename: "cabelo_20.png", path: "sprites/cabelo/cabelo_20.png" },
        { name: "Hidan Hair", filename: "cabelo_21.png", path: "sprites/cabelo/cabelo_21.png" },
        { name: "Iruka Hair", filename: "cabelo_22.png", path: "sprites/cabelo/cabelo_22.png" },
        { name: "Jounnin Hair", filename: "cabelo_23.png", path: "sprites/cabelo/cabelo_23.png" },
        { name: "Tobi Hair", filename: "cabelo_24.png", path: "sprites/cabelo/cabelo_24.png" },
        { name: "Moegi Hair", filename: "cabelo_25.png", path: "sprites/cabelo/cabelo_25.png" },
        { name: "Sasori Hair", filename: "cabelo_26.png", path: "sprites/cabelo/cabelo_26.png" },
        { name: "Pain Hair", filename: "cabelo_27.png", path: "sprites/cabelo/cabelo_27.png" },
        { name: "Temari Hair", filename: "cabelo_28.png", path: "sprites/cabelo/cabelo_28.png" },
        { name: "Black Long Hair v1", filename: "cabelo_29.png", path: "sprites/cabelo/cabelo_29.png" },
        { name: "Black Long Hair v2", filename: "cabelo_30.png", path: "sprites/cabelo/cabelo_30.png" },
        { name: "Black Long Hair v3", filename: "cabelo_31.png", path: "sprites/cabelo/cabelo_31.png" },
        { name: "Black Long Hair v4", filename: "cabelo_32.png", path: "sprites/cabelo/cabelo_32.png" },
        { name: "Chouji Hair", filename: "cabelo_33.png", path: "sprites/cabelo/cabelo_33.png" },
        { name: "Konohamaru", filename: "konohamaru.png", path: "sprites/cabelo/konohamaru.png" },
        { name: "Neji", filename: "neji.png", path: "sprites/cabelo/neji.png" },
        { name: "Sai", filename: "sai.png", path: "sprites/cabelo/sai.png" },
        { name: "Shizune", filename: "shizune.png", path: "sprites/cabelo/shizune.png" },
        { name: "Utakata", filename: "utakata.png", path: "sprites/cabelo/utakata.png" },
        { name: "Minato", filename: "minato.png", path: "sprites/cabelo/minato.png" },
        { name: "Yahiko", filename: "yahiko.png", path: "sprites/cabelo/yahiko.png" },
        { name: "Kushina", filename: "kushina.png", path: "sprites/cabelo/kushina.png" },
        { name: "Kabuto", filename: "kabuto.png", path: "sprites/cabelo/kabuto.png" },
        { name: "Ino", filename: "ino.png", path: "sprites/cabelo/ino.png" },
        { name: "Hinata", filename: "hinata.png", path: "sprites/cabelo/hinata.png" },
        { name: "Kiba", filename: "kiba.png", path: "sprites/cabelo/kiba.png" },
        { name: "Zetsu", filename: "zetsu.png", path: "sprites/cabelo/zetsu.png" },
        { name: "Tobirama", filename: "nidaime.png", path: "sprites/cabelo/nidaime.png" },
        { name: "Sarutobi", filename: "sarutobi.png", path: "sprites/cabelo/sarutobi.png" },
        { name: "Minato_1", filename: "minato_1.png", path: "sprites/cabelo/minato_1.png" },
        { name: "Jiraiya", filename: "jiraiya.png", path: "sprites/cabelo/jiraiya.png" },
        { name: "Tsunade", filename: "tsunade.png", path: "sprites/cabelo/tsunade.png" },
        { name: "Yamato", filename: "yamato.png", path: "sprites/cabelo/yamato.png" },
        { name: "Nagato", filename: "nagato.png", path: "sprites/cabelo/nagato.png" },
        { name: "Chiyo", filename: "chiyo.png", path: "sprites/cabelo/chiyo.png" },
        { name: "Pakura", filename: "pakura.png", path: "sprites/cabelo/pakura.png" },
      ],
      bandana: [
        { name: "Nada", filename: "nada.png", path: "sprites/bandana/nada.png" },
        { name: "Naruto Shippuden Headband", filename: "bandana_1.png", path: "sprites/bandana/bandana_1.png" },
        { name: "Classic Sakura Headband", filename: "bandana_2.png", path: "sprites/bandana/bandana_2.png" },
        { name: "Classic Naruto Headband", filename: "bandana_3.png", path: "sprites/bandana/bandana_3.png" },
        { name: "Blue Kakashi Headband", filename: "bandana_4.png", path: "sprites/bandana/bandana_4.png" },
        { name: "Black Kakashi Headband", filename: "bandana_5.png", path: "sprites/bandana/bandana_5.png" },
        { name: "Deidara Headband", filename: "bandana_6.png", path: "sprites/bandana/bandana_6.png" },
        { name: "Kisame Headband", filename: "bandana_7.png", path: "sprites/bandana/bandana_7.png" },
        { name: "Gennin", filename: "gennin.png", path: "sprites/bandana/gennin.png" },
        { name: "Chunnin", filename: "chunnin.png", path: "sprites/bandana/chunnin.png" },
        { name: "Jounnin", filename: "jounnin.png", path: "sprites/bandana/jounnin.png" },
        { name: "Jounnin 1", filename: "jounnin_1.png", path: "sprites/bandana/jounnin_1.png" },
        { name: "Tobi", filename: "tobi.png", path: "sprites/bandana/tobi.png" },
        { name: "Moegi", filename: "moegi.png", path: "sprites/bandana/moegi.png" },
        { name: "Zetsu", filename: "zetsu.png", path: "sprites/bandana/zetsu.png" },
        { name: "Kakuzu", filename: "kakuzu.png", path: "sprites/bandana/kakuzu.png" },
        { name: "Pain", filename: "pain.png", path: "sprites/bandana/pain.png" },
        { name: "Cachecol", filename: "cachecol.png", path: "sprites/bandana/cachecol.png" },
        { name: "Chouji", filename: "chouji.png", path: "sprites/bandana/chouji.png" },
        { name: "Neji", filename: "neji.png", path: "sprites/bandana/neji.png" },
        { name: "Nidaime", filename: "nidaime.png", path: "sprites/bandana/nidaime.png" },
        { name: "Barba", filename: "barba.png", path: "sprites/bandana/barba.png" },
        { name: "Mascara_1", filename: "mascara_1.png", path: "sprites/bandana/mascara_1.png" },
        { name: "Mascara_2", filename: "mascara_2.png", path: "sprites/bandana/mascara_2.png" },
        { name: "Mascara_3", filename: "mascara_3.png", path: "sprites/bandana/mascara_3.png" },
        { name: "Mascara_4", filename: "mascara_4.png", path: "sprites/bandana/mascara_4.png" },
      ],
      roupa: [
        { name: "Nada", filename: "nada.png", path: "sprites/roupa/nada.png" },

        { name: "Naruto Shippuden Shirt", filename: "roupa_1.png", path: "sprites/roupa/roupa_1.png" },
        { name: "Classic Sakura Shirt", filename: "roupa_2.png", path: "sprites/roupa/roupa_2.png" },
        { name: "Classic Sasuke Shirt", filename: "roupa_3.png", path: "sprites/roupa/roupa_3.png" },
        { name: "Classic Naruto Shirt", filename: "roupa_4.png", path: "sprites/roupa/roupa_4.png" },
        { name: "Akatsuki Cloth", filename: "roupa_5.png", path: "sprites/roupa/roupa_5.png" },
        { name: "Hokage Robe", filename: "roupa_6.png", path: "sprites/roupa/roupa_6.png" },
        { name: "Mizukage Robe", filename: "roupa_7.png", path: "sprites/roupa/roupa_7.png" },
        { name: "Tsuchikage Robe", filename: "roupa_8.png", path: "sprites/roupa/roupa_8.png" },
        { name: "Raikage Robe", filename: "roupa_9.png", path: "sprites/roupa/roupa_9.png" },
        { name: "Kazekage Robe", filename: "roupa_10.png", path: "sprites/roupa/roupa_10.png" },
        { name: "Gennin Cloth", filename: "roupa_11.png", path: "sprites/roupa/roupa_11.png" },
        { name: "Jounnin Cloth", filename: "roupa_12.png", path: "sprites/roupa/roupa_12.png" },
        { name: "Lee Cloth", filename: "roupa_13.png", path: "sprites/roupa/roupa_13.png" },
        { name: "Hidan Cloth", filename: "roupa_14.png", path: "sprites/roupa/roupa_14.png" },
        { name: "Moegi Cloth", filename: "roupa_15.png", path: "sprites/roupa/roupa_15.png" },
        { name: "Temari Cloth", filename: "roupa_16.png", path: "sprites/roupa/roupa_16.png" },
        { name: "Konohamaru Cloth", filename: "roupa_17.png", path: "sprites/roupa/roupa_17.png" },
        { name: "Shikamaru Cloth", filename: "roupa_18.png", path: "sprites/roupa/roupa_18.png" },
        { name: "Neji Cloth", filename: "roupa_19.png", path: "sprites/roupa/roupa_19.png" },
        { name: "Chouji Cloth", filename: "roupa_20.png", path: "sprites/roupa/roupa_20.png" },
        { name: "Madara Cloth", filename: "roupa_21.png", path: "sprites/roupa/roupa_21.png" },
        { name: "Neji Cloth", filename: "roupa_22.png", path: "sprites/roupa/roupa_22.png" },
        { name: "Shizune Cloth", filename: "roupa_23.png", path: "sprites/roupa/roupa_23.png" },
        { name: "Sai Cloth", filename: "roupa_24.png", path: "sprites/roupa/roupa_24.png" },
        { name: "Shiny Akatsuki Cloth", filename: "roupa_25.png", path: "sprites/roupa/roupa_25.png" },
        { name: "Shiny Akatsuki Cloth", filename: "roupa_26.png", path: "sprites/roupa/roupa_26.png" },
        { name: "Ino Cloth", filename: "roupa_27.png", path: "sprites/roupa/roupa_27.png" },
        { name: "Ino Cloth v2", filename: "roupa_28.png", path: "sprites/roupa/roupa_28.png" },
        { name: "Kiba Cloth", filename: "kiba.png", path: "sprites/roupa/kiba.png" },
        { name: "Nidaime Cloth", filename: "nidaime.png", path: "sprites/roupa/nidaime.png" },
        { name: "Minato Cloth", filename: "roupa_29.png", path: "sprites/roupa/roupa_29.png" },
        { name: "Jiraiya Cloth", filename: "jiraiya.png", path: "sprites/roupa/jiraiya.png" },
        { name: "Tsunade Cloth", filename: "tsunade.png", path: "sprites/roupa/tsunade.png" },
        { name: "Utakata Cloth", filename: "utakata.png", path: "sprites/roupa/utakata.png" },
        { name: "Sasuke Cloth", filename: "sasuke.png", path: "sprites/roupa/sasuke.png" },
        { name: "Ninja Cloth", filename: "ropa_1.png", path: "sprites/roupa/ropa_1.png" },
        { name: "Ninja Cloth", filename: "ropa_2.png", path: "sprites/roupa/ropa_2.png" },
        { name: "Ninja Cloth", filename: "ropa_3.png", path: "sprites/roupa/ropa_3.png" },
        { name: "Ninja Cloth", filename: "ropa_4.png", path: "sprites/roupa/ropa_4.png" },
        { name: "Chiyo Cloth", filename: "chiyo.png", path: "sprites/roupa/chiyo.png" },
      ],
      calca: [
        { name: "Nada", filename: "nada.png", path: "sprites/calca/nada.png" },

        { name: "Naruto Shippuden Legs", filename: "calca_1.png", path: "sprites/calca/calca_1.png" },
        { name: "Classic Sakura Legs", filename: "calca_2.png", path: "sprites/calca/calca_2.png" },
        { name: "Classic Sasuke Legs", filename: "calca_3.png", path: "sprites/calca/calca_3.png" },
        { name: "Classic Naruto Legs", filename: "calca_4.png", path: "sprites/calca/calca_4.png" },
        { name: "Akatsuki Legs", filename: "calca_5.png", path: "sprites/calca/calca_5.png" },
        { name: "Hokage Legs", filename: "calca_6.png", path: "sprites/calca/calca_6.png" },
        { name: "Mizukage Legs", filename: "calca_7.png", path: "sprites/calca/calca_7.png" },
        { name: "Tsuchikage Legs", filename: "calca_8.png", path: "sprites/calca/calca_8.png" },
        { name: "Raikage Legs", filename: "calca_9.png", path: "sprites/calca/calca_9.png" },
        { name: "Kazekage Legs", filename: "calca_10.png", path: "sprites/calca/calca_10.png" },
        { name: "Gennin Legs", filename: "calca_11.png", path: "sprites/calca/calca_11.png" },
        { name: "Jounnin Legs", filename: "calca_12.png", path: "sprites/calca/calca_12.png" },
        { name: "Lee Legs", filename: "calca_13.png", path: "sprites/calca/calca_13.png" },
        { name: "Moegi Legs", filename: "calca_14.png", path: "sprites/calca/calca_14.png" },
        { name: "Temari Legs", filename: "calca_15.png", path: "sprites/calca/calca_15.png" },
        { name: "Konohamaru Legs", filename: "calca_16.png", path: "sprites/calca/calca_16.png" },
        { name: "Black Legs", filename: "calca_17.png", path: "sprites/calca/calca_17.png" },
        { name: "Green Legs", filename: "calca_18.png", path: "sprites/calca/calca_18.png" },
        { name: "Blue Legs", filename: "calca_19.png", path: "sprites/calca/calca_19.png" },
        { name: "Purple Legs", filename: "calca_20.png", path: "sprites/calca/calca_20.png" },
        { name: "Red Legs", filename: "calca_21.png", path: "sprites/calca/calca_21.png" },
        { name: "Cyan Legs", filename: "calca_22.png", path: "sprites/calca/calca_22.png" },
        { name: "Chouji Legs", filename: "calca_23.png", path: "sprites/calca/calca_23.png" },
        { name: "Madara Legs", filename: "calca_24.png", path: "sprites/calca/calca_24.png" },
        { name: "Neji Legs", filename: "calca_25.png", path: "sprites/calca/calca_25.png" },
        { name: "Shizune Legs", filename: "calca_26.png", path: "sprites/calca/calca_26.png" },
        { name: "Sai Legs", filename: "calca_27.png", path: "sprites/calca/calca_27.png" },
        { name: "Shiny Akatsuki Legs", filename: "calca_28.png", path: "sprites/calca/calca_28.png" },
        { name: "Ino Legs", filename: "calca_29.png", path: "sprites/calca/calca_29.png" },
        { name: "Ino Legs v2", filename: "calca_30.png", path: "sprites/calca/calca_30.png" },
        { name: "Kiba Legs", filename: "kiba.png", path: "sprites/calca/kiba.png" },
        { name: "Nidaime Legs", filename: "nidaime.png", path: "sprites/calca/nidaime.png" },
        { name: "Minato Legs", filename: "calca_31.png", path: "sprites/calca/calca_31.png" },
        { name: "Jiraiya Legs", filename: "jiraiya.png", path: "sprites/calca/jiraiya.png" },
        { name: "Tsunade Legs", filename: "tsunade.png", path: "sprites/calca/tsunade.png" },
        { name: "Utakata Legs", filename: "utakata.png", path: "sprites/calca/utakata.png" },
        { name: "Sasuke Legs", filename: "sasuke.png", path: "sprites/calca/sasuke.png" },
        { name: "Chiyo Legs", filename: "chiyo.png", path: "sprites/calca/chiyo.png" },
      ],
      arma: [
        { name: "Nada", filename: "nada.png", path: "sprites/arma/nada.png" },
        { name: "Sorriso Gai", filename: "sorriso_gai.png", path: "sprites/arma/sorriso_gai.png" },
        { name: "Kisame Serdas", filename: "kisame_serdas.png", path: "sprites/arma/kisame_serdas.png" },
        { name: "Itachi Olheiras", filename: "itachi.png", path: "sprites/arma/itachi.png" },
        { name: "Iruka Cicatriz", filename: "iruka.png", path: "sprites/arma/iruka.png" },
        { name: "Pain", filename: "pain.png", path: "sprites/arma/pain.png" },
        { name: "Blush", filename: "blush.png", path: "sprites/arma/blush.png" },
        { name: "Blush Forte", filename: "blush_forte.png", path: "sprites/arma/blush_forte.png" },
        { name: "Pinca", filename: "pinca.png", path: "sprites/arma/pinca.png" },
        { name: "Kiba", filename: "kiba.png", path: "sprites/arma/kiba.png" },
        { name: "Nidaime", filename: "nidaime.png", path: "sprites/arma/nidaime.png" },
        { name: "Rugas", filename: "rugas.png", path: "sprites/arma/rugas.png" },
        { name: "Tsunade", filename: "tsunade.png", path: "sprites/arma/tsunade.png" },
        { name: "Susanoo", filename: "susanoo.png", path: "sprites/arma/susanoo.png" },
        { name: "Sasuke Seal", filename: "sasukeseal.png", path: "sprites/arma/sasukeseal.png" },
      ],
      chapeu: [
        { name: "Nada", filename: "nada.png", path: "sprites/chapeu/nada.png" },
        
        { name: "Hokage Hat", filename: "hokage_hat.png", path: "sprites/chapeu/hokage_hat.png" },
        { name: "Mizukage Hat", filename: "mizukage_hat.png", path: "sprites/chapeu/mizukage_hat.png" },
        { name: "Tsuchikage Hat", filename: "doton_hat.png", path: "sprites/chapeu/doton_hat.png" },
        { name: "Raikage Hat", filename: "raikage_hat.png", path: "sprites/chapeu/raikage_hat.png" },
        { name: "Kazekage Hat", filename: "suna_hat.png", path: "sprites/chapeu/suna_hat.png" },
        { name: "Chouji Cachecol", filename: "cachecolchouji.png", path: "sprites/chapeu/cachecolchouji.png" },
      ],
      armatraseira: [
        { name: "Nada", filename: "nada.png", path: "sprites/armatraseira/nada.png" },
        { name: "Samehada", filename: "samehada.png", path: "sprites/armatraseira/samehada.png" },
        { name: "Foice", filename: "hidan.png", path: "sprites/armatraseira/hidan.png" },
        { name: "Foice", filename: "shiny_hidan.png", path: "sprites/armatraseira/shiny_hidan.png" },
        { name: "Temari", filename: "temari.png", path: "sprites/armatraseira/temari.png" },
        { name: "Sai", filename: "sai.png", path: "sprites/armatraseira/sai.png" },
      ]
    };

    if (fallbackItems[category]) {
      this.availableItems[category] = fallbackItems[category];
    }
  }

  setupEventListeners() {
    // Event listeners para frames
    document.querySelectorAll(".frame-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const frameNumber = parseInt(e.target.dataset.frame);
        this.switchFrame(frameNumber);
      });
    });

    // Event listeners para controles principais
    document.getElementById("randomizeCharacter")?.addEventListener("click", () => this.randomizeCharacter());
    document.getElementById("exportCharacter")?.addEventListener("click", () => this.exportCharacter());

    // Event listener para color picker
    document.getElementById("bgColor")?.addEventListener("change", (e) => {
      this.backgroundColorHex = e.target.value;
      this.renderCharacter();
      if (this.previewImage) {
        this.updatePreview();
      }
    });

    // Event listeners para configuração
    document.getElementById("exportConfig")?.addEventListener("click", () => this.exportConfiguration());
    document.getElementById("loadConfig")?.addEventListener("click", () => this.loadConfiguration());
    document.getElementById("configFileInput")?.addEventListener("change", (e) => this.handleConfigFileLoad(e));

    // Event listeners para busca
    document.getElementById("itemSearch")?.addEventListener("input", (e) => this.filterItems(e.target.value));
    document.getElementById("clearSearch")?.addEventListener("click", () => this.clearSearch());

    // Event listener para remover item
    document.getElementById("removeItem")?.addEventListener("click", () => this.removeCurrentItem());
    
    // Event listener para excluir item da lista
    document.getElementById("deleteFromList")?.addEventListener("click", () => this.deleteItemFromList());

    // Event listeners para upload de novos itens
    this.setupUploadEventListeners();
  }

  setupUploadEventListeners() {
    const selectFileBtn = document.getElementById("selectFile");
    const newItemFile = document.getElementById("newItemFile");
    const categorySelect = document.getElementById("categorySelect");
    const previewSection = document.getElementById("previewSection");
    const posXSlider = document.getElementById("posX");
    const posYSlider = document.getElementById("posY");
    const addItemBtn = document.getElementById("addItem");

    // Botão para selecionar arquivo
    selectFileBtn?.addEventListener("click", () => {
      newItemFile?.click();
    });

    // Quando um arquivo é selecionado
    newItemFile?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        this.handleImageUpload(file);
      }
    });

    // Quando uma categoria é selecionada
    categorySelect?.addEventListener("change", (e) => {
      if (e.target.value && this.previewImage) {
        previewSection.style.display = "block";
        this.updatePreview();
      } else {
        previewSection.style.display = "none";
      }
    });

    // Sliders de posição
    posXSlider?.addEventListener("input", (e) => {
      this.previewPosition.x = parseInt(e.target.value);
      this.updatePreview();
    });

    posYSlider?.addEventListener("input", (e) => {
      this.previewPosition.y = parseInt(e.target.value);
      this.updatePreview();
    });

    // Botão para adicionar item
    addItemBtn?.addEventListener("click", () => {
      this.addUploadedItem();
    });
  }

  handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.previewImage = img;
        this.previewPosition = { x: 0, y: 0 };
        
        // Resetar sliders
        document.getElementById("posX").value = 0;
        document.getElementById("posY").value = 0;
        
        // Mostrar preview section se categoria estiver selecionada
        const categorySelect = document.getElementById("categorySelect");
        const previewSection = document.getElementById("previewSection");
        if (categorySelect.value) {
          previewSection.style.display = "block";
          this.updatePreview();
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  updatePreview() {
    if (!this.previewImage || !this.previewCtx) return;

    // Limpar canvas de preview
    this.previewCtx.clearRect(0, 0, this.canvasSize, this.canvasSize);

    // Desenhar background com cor selecionada
    this.previewCtx.fillStyle = this.backgroundColorHex;
    this.previewCtx.fillRect(0, 0, this.canvasSize, this.canvasSize);

    // Carregar e desenhar corpo 3 como base
    const baseBody = new Image();
    baseBody.onload = () => {
      // Desenhar corpo 3
      this.previewCtx.drawImage(baseBody, 0, 0, this.canvasSize, this.canvasSize);
      
      // Desenhar a imagem na posição ajustada - usando canvasSize (64x64) em vez de spriteSize (32x32)
      const x = (this.canvasSize / 2) + this.previewPosition.x - (this.canvasSize / 2);
      const y = (this.canvasSize / 2) + this.previewPosition.y - (this.canvasSize / 2);
      
      this.previewCtx.drawImage(this.previewImage, x, y, this.canvasSize, this.canvasSize);
    };
    baseBody.src = "sprites/rosto/rosto_3.png";
  }

  addUploadedItem() {
    const categorySelect = document.getElementById("categorySelect");
    const category = categorySelect.value;
    
    if (!category || !this.previewImage) {
      alert("Selecione uma categoria e uma imagem!");
      return;
    }

    // Criar canvas para o novo item - usando canvasSize (64x64) em vez de spriteSize (32x32)
    const itemCanvas = document.createElement("canvas");
    itemCanvas.width = this.canvasSize;
    itemCanvas.height = this.canvasSize;
    const itemCtx = itemCanvas.getContext("2d");
    itemCtx.imageSmoothingEnabled = false;

    // Desenhar a imagem redimensionada para 64x64
    itemCtx.drawImage(this.previewImage, 0, 0, this.canvasSize, this.canvasSize);

    // Converter para data URL
    const dataURL = itemCanvas.toDataURL("image/png");

    // Criar item
    const timestamp = Date.now();
    const newItem = {
      name: `Item Personalizado ${timestamp}`,
      filename: `custom_${timestamp}.png`,
      path: dataURL,
      isCustom: true,
      position: { ...this.previewPosition }
    };

    // Adicionar à lista de itens uploadados
    if (!this.uploadedItems[category]) {
      this.uploadedItems[category] = [];
    }
    this.uploadedItems[category].push(newItem);

    // Adicionar à lista de itens disponíveis
    this.availableItems[category].push(newItem);

    // Atualizar interface
    if (this.currentCategory === category) {
      this.updateItemsGrid();
    }

    // Limpar upload
    this.clearUpload();

    // Feedback
    alert("Item adicionado com sucesso!");
  }

  clearUpload() {
    this.previewImage = null;
    this.previewPosition = { x: 0, y: 0 };
    
    document.getElementById("newItemFile").value = "";
    document.getElementById("categorySelect").value = "";
    document.getElementById("previewSection").style.display = "none";
    document.getElementById("posX").value = 0;
    document.getElementById("posY").value = 0;
  }

  updateCategoryTabs() {
    const tabsContainer = document.getElementById("categoryTabs");
    if (!tabsContainer) return;

    tabsContainer.innerHTML = "";

    this.categories.forEach((category) => {
      const btn = document.createElement("button");
      btn.className = "tab-btn";
      btn.dataset.category = category;
      btn.textContent = this.formatCategoryName(category);
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", "false");

      if (category === this.currentCategory) {
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
      }

      btn.addEventListener("click", () => this.switchCategory(category));
      tabsContainer.appendChild(btn);
    });
  }

  formatCategoryName(category) {
    const names = {
      armatraseira: "Arma T.",
      corpo: "Corpo",
      olhos: "Olhos",
      cabelo: "Cabelo",
      bandana: "Bandana",
      roupa: "Roupa",
      calca: "Calça",
      arma: "Arma",
      chapeu: "Chapéu"
    };
    return names[category] || category;
  }

  switchFrame(frameNumber) {
    this.currentFrame = frameNumber;

    // Atualizar visual dos seletores
    document.querySelectorAll(".frame-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    const activeSelector = document.querySelector(`[data-frame="${frameNumber}"]`);
    if (activeSelector) {
      activeSelector.classList.add("active");
    }

    // Atualizar grid para mostrar seleções do frame atual
    this.updateItemsGrid();
    this.updateSelectedItemInfo();
    this.updateCSSControls();
  }

  getCurrentCharacter() {
    return this.currentFrame === 1 ? this.frame1Character : this.frame2Character;
  }

  switchCategory(category) {
    this.currentCategory = category;

    // Atualizar abas
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });

    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
      activeBtn.classList.add("active");
      activeBtn.setAttribute("aria-selected", "true");
    }

    // Atualizar grid de itens
    this.updateItemsGrid();
    this.updateCSSControls();
  }

  updateItemsGrid(searchTerm = '') {
    const grid = document.getElementById("itemsGrid");
    if (!grid) {
      console.error("Grid não encontrado!");
      return;
    }

    grid.innerHTML = "";

    const items = this.availableItems[this.currentCategory] || [];
    
    // Filtrar itens baseado no termo de busca
    const filteredItems = searchTerm 
      ? items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : items;

    if (filteredItems.length === 0) {
      const message = searchTerm 
        ? `Nenhum item encontrado para "${searchTerm}"<br><small>Tente outro termo de busca</small>`
        : `Nenhum item encontrado nesta categoria<br><small>Adicione arquivos PNG na pasta sprites/${this.currentCategory}/</small>`;
      
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 20px;">
          ${message}
        </div>`;
      this.updateSelectedItemInfo();
      return;
    }

    const currentCharacter = this.getCurrentCharacter();

    filteredItems.forEach((item, filteredIndex) => {
      // Encontrar o índice original do item na lista completa
      const originalIndex = items.findIndex(originalItem => originalItem.filename === item.filename);
      
      const itemDiv = document.createElement("div");
      itemDiv.className = "item-option";
      itemDiv.dataset.category = this.currentCategory;
      itemDiv.dataset.index = originalIndex; // Usar índice original
      itemDiv.setAttribute("tabindex", "0");
      itemDiv.setAttribute("role", "button");
      itemDiv.setAttribute("aria-label", `Selecionar ${item.name}`);

      // Verificar se este item está selecionado no frame atual
      if (currentCharacter[this.currentCategory] && currentCharacter[this.currentCategory].filename === item.filename) {
        itemDiv.classList.add("selected");
      }

      itemDiv.innerHTML = `
        <img src="${item.path}" alt="${item.name}" 
             onerror="console.error('Erro ao carregar:', '${item.path}'); this.style.display='none';"
             loading="lazy">
        <div class="item-name">${item.name}</div>
      `;

      // Event listeners para clique e teclado
      const selectItem = () => this.selectItem(this.currentCategory, originalIndex);
      itemDiv.addEventListener("click", selectItem);
      itemDiv.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectItem();
        }
      });

      grid.appendChild(itemDiv);
    });

    // Atualizar informações do item selecionado
    this.updateSelectedItemInfo();
  }

  filterItems(searchTerm) {
    this.updateItemsGrid(searchTerm);
  }

  clearSearch() {
    const searchInput = document.getElementById("itemSearch");
    if (searchInput) {
      searchInput.value = "";
      this.updateItemsGrid();
    }
  }

  selectItem(category, index) {
    const item = this.availableItems[category][index];
    if (!item) {
      console.error("Item não encontrado!");
      return;
    }

    // Atualizar o personagem do frame atual
    const currentCharacter = this.getCurrentCharacter();
    currentCharacter[category] = item;

    // Atualizar visual da seleção
    document.querySelectorAll(".item-option").forEach((el) => {
      el.classList.remove("selected");
    });

    const selectedEl = document.querySelector(`[data-category="${category}"][data-index="${index}"]`);
    if (selectedEl) {
      selectedEl.classList.add("selected");
    }

    // Atualizar informações
    this.updateSelectedItemInfo();
    this.updateCSSControls();

    // Re-renderizar personagem
    this.renderCharacter();
  }

  updateSelectedItemInfo() {
    const currentCharacter = this.getCurrentCharacter();
    const selectedItem = currentCharacter[this.currentCategory];
    const nameElement = document.getElementById("selectedItemName");

    if (nameElement) {
      if (selectedItem) {
        nameElement.textContent = `Frame ${this.currentFrame} - ${this.currentCategory}: ${selectedItem.name}`;
      } else {
        nameElement.textContent = `Frame ${this.currentFrame} - Nenhum ${this.currentCategory} selecionado`;
      }
    }
  }

  // Gerar chave única para cada item específico
  getItemKey(category, frame, filename) {
    return `${category}_frame${frame}_${filename}`;
  }

  updateCSSControls() {
    const cssControlsContainer = document.getElementById("cssControls");
    if (!cssControlsContainer) return;

    const currentCharacter = this.getCurrentCharacter();
    const selectedItem = currentCharacter[this.currentCategory];

    if (!selectedItem) {
      cssControlsContainer.innerHTML = '<p>Selecione um item para personalizar</p>';
      return;
    }

    // Chave única para este item específico
    const itemKey = this.getItemKey(this.currentCategory, this.currentFrame, selectedItem.filename);
    const currentProps = this.cssProperties[itemKey] || {};

    cssControlsContainer.innerHTML = `
      <h4>Personalização - ${selectedItem.name}</h4>
      
      <div class="css-control">
        <label for="hueRotate">Matiz:</label>
        <input type="range" id="hueRotate" min="0" max="360" value="${currentProps.hueRotate || 0}" step="1">
        <span id="hueValue">${currentProps.hueRotate || 0}°</span>
      </div>
      
      <div class="css-control">
        <label for="brightness">Brilho:</label>
        <input type="range" id="brightness" min="0" max="200" value="${currentProps.brightness || 100}" step="1">
        <span id="brightnessValue">${currentProps.brightness || 100}%</span>
      </div>
      
      <div class="css-control">
        <label for="contrast">Contraste:</label>
        <input type="range" id="contrast" min="0" max="200" value="${currentProps.contrast || 100}" step="1">
        <span id="contrastValue">${currentProps.contrast || 100}%</span>
      </div>
      
      <div class="css-control">
        <label for="saturation">Saturação:</label>
        <input type="range" id="saturation" min="0" max="200" value="${currentProps.saturation || 100}" step="1">
        <span id="saturationValue">${currentProps.saturation || 100}%</span>
      </div>
      
      <div class="css-control">
        <label for="scaleX">Escala X:</label>
        <input type="range" id="scaleX" min="0.5" max="2" value="${currentProps.scaleX || 1}" step="0.1">
        <span id="scaleXValue">${currentProps.scaleX || 1}</span>
      </div>
      
      <div class="css-control">
        <label for="scaleY">Escala Y:</label>
        <input type="range" id="scaleY" min="0.5" max="2" value="${currentProps.scaleY || 1}" step="0.1">
        <span id="scaleYValue">${currentProps.scaleY || 1}</span>
      </div>
      
      <div class="css-control">
        <label for="opacity">Opacidade:</label>
        <input type="range" id="opacity" min="0" max="100" value="${currentProps.opacity || 100}" step="1">
        <span id="opacityValue">${currentProps.opacity || 100}%</span>
      </div>
      
      <button id="resetCSS">Resetar</button>
    `;

    // Configurar event listeners para os controles CSS
    this.setupCSSControlListeners(itemKey);
  }

  setupCSSControlListeners(itemKey) {
    const controls = ["hueRotate", "brightness", "contrast", "saturation", "scaleX", "scaleY", "opacity"];
    
    controls.forEach(control => {
      const input = document.getElementById(control);
      const valueSpan = document.getElementById(control + "Value");
      
      if (input && valueSpan) {
        input.addEventListener("input", (e) => {
          const value = e.target.value;
          
          // Atualizar display do valor
          if (control === "hueRotate") {
            valueSpan.textContent = value + "°";
          } else if (control.includes("scale")) {
            valueSpan.textContent = value;
          } else {
            valueSpan.textContent = value + "%";
          }
          
          // Aplicar CSS
          this.applyCSSProperty(itemKey, control, value);
        });
      }
    });

    // Botão de reset
    const resetBtn = document.getElementById("resetCSS");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.resetCSSProperties(itemKey);
      });
    }
  }

  applyCSSProperty(itemKey, property, value) {
    if (!this.cssProperties[itemKey]) {
      this.cssProperties[itemKey] = {};
    }

    this.cssProperties[itemKey][property] = value;
    this.renderCharacter();
  }

  resetCSSProperties(itemKey) {
    this.cssProperties[itemKey] = {};
    this.updateCSSControls();
    this.renderCharacter();
  }

  removeCurrentItem() {
    const currentCharacter = this.getCurrentCharacter();
    const selectedItem = currentCharacter[this.currentCategory];
    
    if (selectedItem) {
      // Limpar propriedades CSS do item removido
      const itemKey = this.getItemKey(this.currentCategory, this.currentFrame, selectedItem.filename);
      delete this.cssProperties[itemKey];
    }
    
    currentCharacter[this.currentCategory] = null;
    
    this.updateItemsGrid();
    this.updateCSSControls();
    this.renderCharacter();
  }

  deleteItemFromList() {
    const currentCharacter = this.getCurrentCharacter();
    const selectedItem = currentCharacter[this.currentCategory];
    
    if (!selectedItem) {
      alert("Nenhum item selecionado para excluir!");
      return;
    }

    // Só permitir excluir itens personalizados
    if (!selectedItem.isCustom) {
      alert("Só é possível excluir itens personalizados da lista!");
      return;
    }

    if (confirm(`Tem certeza que deseja excluir "${selectedItem.name}" da lista?`)) {
      // Remover da lista de itens disponíveis
      const items = this.availableItems[this.currentCategory];
      const index = items.findIndex(item => item.filename === selectedItem.filename);
      if (index !== -1) {
        items.splice(index, 1);
      }

      // Remover da lista de itens uploadados
      if (this.uploadedItems[this.currentCategory]) {
        const uploadIndex = this.uploadedItems[this.currentCategory].findIndex(item => item.filename === selectedItem.filename);
        if (uploadIndex !== -1) {
          this.uploadedItems[this.currentCategory].splice(uploadIndex, 1);
        }
      }

      // Limpar seleção atual
      currentCharacter[this.currentCategory] = null;

      // Limpar propriedades CSS
      const itemKey = this.getItemKey(this.currentCategory, this.currentFrame, selectedItem.filename);
      delete this.cssProperties[itemKey];

      // Atualizar interface
      this.updateItemsGrid();
      this.updateCSSControls();
      this.renderCharacter();

      alert("Item excluído da lista com sucesso!");
    }
  }

  renderCharacter() {
    // Renderizar frame 1
    this.renderFrame(this.frame1Character, this.ctx1, 1);

    // Renderizar frame 2
    this.renderFrame(this.frame2Character, this.ctx2, 2);
  }

  renderFrame(character, ctx, frameNumber) {
    // Limpar canvas
    ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);

    // Configurar para pixel art
    ctx.imageSmoothingEnabled = false;

    // Desenhar background com cor selecionada
    ctx.fillStyle = this.backgroundColorHex;
    ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

    // Definir ordem de renderização (z-index)
    const layerOrder = [
      "armatraseira",
      "corpo",
      "calca",
      "roupa",
      "olhos",
      "cabelo",
      "bandana",
      "arma",
      "chapeu",
    ];

    // Renderizar cada camada na ordem correta
    for (const layer of layerOrder) {
      const item = character[layer];
      if (!item) continue;

      // Criar nova imagem para cada camada
      const img = new Image();
      img.onload = () => {
        // Obter propriedades CSS específicas para este item
        const itemKey = this.getItemKey(layer, frameNumber, item.filename);
        const cssProps = this.cssProperties[itemKey] || {};

        ctx.save();
        
        // Aplicar filtros CSS específicos para este item
        let filterString = "";
        if (cssProps.hueRotate) filterString += `hue-rotate(${cssProps.hueRotate}deg) `;
        if (cssProps.brightness) filterString += `brightness(${cssProps.brightness}%) `;
        if (cssProps.contrast) filterString += `contrast(${cssProps.contrast}%) `;
        if (cssProps.saturation) filterString += `saturate(${cssProps.saturation}%) `;
        
        if (filterString) {
          ctx.filter = filterString.trim();
        }

        let scaleX = parseFloat(cssProps.scaleX) || 1;
        let scaleY = parseFloat(cssProps.scaleY) || 1;
        let opacity = (parseFloat(cssProps.opacity) || 100) / 100;
        
        ctx.globalAlpha = opacity;
        ctx.scale(scaleX, scaleY);
        
        // Calcular posição (incluindo posição personalizada para itens uploadados)
        let drawX = scaleX !== 1 ? (this.canvasSize * (1 - scaleX)) / (2 * scaleX) : 0;
        let drawY = scaleY !== 1 ? (this.canvasSize * (1 - scaleY)) / (2 * scaleY) : 0;
        
        // Aplicar posição personalizada se for item uploadado
        if (item.isCustom && item.position) {
          drawX += item.position.x / scaleX;
          drawY += item.position.y / scaleY;
        }
        
        const drawWidth = this.canvasSize / scaleX;
        const drawHeight = this.canvasSize / scaleY;
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        
        // Restaurar estado do contexto
        ctx.restore();
      };
      img.onerror = () => {
        console.error(`Erro ao carregar: ${item.path}`);
      };
      img.src = item.path;
    }
  }

  exportCharacter() {
    const frameToExport = this.currentFrame === 1 ? this.canvas1 : this.canvas2;

    const link = document.createElement("a");
    link.download = `personagem_frame${this.currentFrame}.png`;
    link.href = frameToExport.toDataURL();
    link.click();

    // Feedback visual
    const btn = document.getElementById("exportCharacter");
    const originalText = btn.textContent;
    btn.textContent = "✓ Exportado!";
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }

  exportConfiguration() {
    const config = {
      frame1Character: this.frame1Character,
      frame2Character: this.frame2Character,
      cssProperties: this.cssProperties,
      uploadedItems: this.uploadedItems,
      timestamp: new Date().toISOString(),
      version: "2.0"
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.download = `character_config_${new Date().toISOString().slice(0, 10)}.json`;
    link.href = URL.createObjectURL(dataBlob);
    link.click();

    // Feedback visual
    const btn = document.getElementById("exportConfig");
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = "✓ Exportado!";
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    }
  }

  loadConfiguration() {
    const fileInput = document.getElementById("configFileInput");
    if (fileInput) {
      fileInput.click();
    }
  }

  handleConfigFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        
        // Validar estrutura básica
        if (config.frame1Character && config.frame2Character) {
          this.frame1Character = config.frame1Character;
          this.frame2Character = config.frame2Character;
          
          if (config.cssProperties) {
            this.cssProperties = config.cssProperties;
          }

          if (config.uploadedItems) {
            this.uploadedItems = config.uploadedItems;
            // Recarregar sprites para incluir itens uploadados
            this.loadAvailableSprites();
          }

          // Atualizar interface
          this.updateItemsGrid();
          this.updateSelectedItemInfo();
          this.updateCSSControls();
          this.renderCharacter();

          // Feedback visual
          const btn = document.getElementById("loadConfig");
          if (btn) {
            const originalText = btn.textContent;
            btn.textContent = "✓ Carregado!";
            setTimeout(() => {
              btn.textContent = originalText;
            }, 2000);
          }
        } else {
          throw new Error("Formato de arquivo inválido");
        }
      } catch (error) {
        console.error("Erro ao carregar configuração:", error);
        alert("Erro ao carregar configuração. Verifique se o arquivo está no formato correto.");
      }
    };

    reader.readAsText(file);
  }

  randomizeCharacter() {
    const currentCharacter = this.getCurrentCharacter();

    for (const category of this.categories) {
      const items = this.availableItems[category];
      if (items && items.length > 0) {
        // Sempre selecionar um item (100% de chance)
        const randomIndex = Math.floor(Math.random() * items.length);
        currentCharacter[category] = items[randomIndex];
      }
    }

    this.updateItemsGrid();
    this.updateCSSControls();
    this.renderCharacter();

    // Feedback visual
    const btn = document.getElementById("randomizeCharacter");
    const originalText = btn.textContent;
    btn.textContent = "✨ Gerado!";
    setTimeout(() => {
      btn.textContent = originalText;
    }, 1500);
  }
}

// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  window.characterCreator = new CharacterCreatorImproved();
});

