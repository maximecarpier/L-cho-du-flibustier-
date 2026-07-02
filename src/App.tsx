import { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Anchor, 
  Skull, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Flame, 
  Sparkles, 
  Coins, 
  Info,
  Waves,
  Music,
  User,
  Activity,
  Database,
  Cloud,
  Check,
  RefreshCw,
  Sliders,
  Radio,
  Wifi,
  WifiOff
} from 'lucide-react';

import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  getSupabaseClient, 
  saveProgressToSupabase, 
  loadProgressFromSupabase,
  PirateProgress 
} from './supabaseClient';

// Tableaux et gravures d'époque libres de droit (Wikimedia Commons)
const ART_SETS = {
  cover: "https://upload.wikimedia.org/wikipedia/commons/1/14/Howard_Pyle_-_Captain_Kidd_on_the_Deck_of_the_Adventure_Galley.jpg",
  blackbeard: "https://upload.wikimedia.org/wikipedia/commons/6/62/Capture_of_the_Pirate_Blackbeard%2C_1718.jpg",
  blackbart: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Bartholomew_Roberts_with_ships.jpg",
  bonny_read: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Anne_Bonny_and_Mary_Read_engraving_by_Benjamin_Cole_c._1724.jpg"
};

// Available AI Narrators with custom voices
interface Narrator {
  id: string;
  name: string;
  title: string;
  description: string;
  voiceName: string;
  color: string;
}

const NARRATORS: Narrator[] = [
  {
    id: 'charon',
    name: 'Capitaine Charon',
    title: 'Le Vieux Loup de Mer',
    description: 'Une voix d\'outre-tombe, sombre, caverneuse et théâtrale.',
    voiceName: 'Charon',
    color: 'text-red-400 border-red-900/40 bg-red-950/20'
  },
  {
    id: 'fenrir',
    name: 'Quartier-Maître Fenrir',
    title: 'Le Briseur de Glace',
    description: 'Une voix rugueuse, directe, grave et pleine de cicatrices.',
    voiceName: 'Fenrir',
    color: 'text-amber-400 border-amber-900/40 bg-amber-950/20'
  },
  {
    id: 'kore',
    name: 'La Sirène Kore',
    title: 'La Voix des Abysses',
    description: 'Une voix douce, envoûtante, mystique et mélodieuse.',
    voiceName: 'Kore',
    color: 'text-cyan-400 border-cyan-900/40 bg-cyan-950/20'
  },
  {
    id: 'zephyr',
    name: 'Le Mousse Zéphyr',
    title: 'L\'Esprit de la Tempête',
    description: 'Une voix plus jeune, vive, mystérieuse et palpitante.',
    voiceName: 'Puck',
    color: 'text-emerald-400 border-emerald-900/40 bg-emerald-950/20'
  }
];

// Definition of stories and interactive branches
interface Choice {
  text: string;
  nextPage: number;
  relicId: string;
  relicName: string;
  relicIcon: string;
  relicDesc: string;
}

interface PageData {
  text: string;
  illustration: string;
  choices?: Choice[];
  ambientSound?: string; // e.g. 'calm', 'storm', 'cave'
}

interface Story {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: any;
  coverImage: string;
  pages: {
    [key: number]: PageData;
  };
}

const STORIES: Story[] = [
  {
    id: 'blackbeard',
    title: 'La Traque de Barbe Noire',
    tagline: "L'affrontement légendaire à Ocracoke Inlet (1718)",
    description: "Embarquez aux côtés du lieutenant Robert Maynard pour débusquer et terrasser le plus terrifiant pirate des Caraïbes, Edward Thache, dit Barbe Noire.",
    icon: Flame,
    coverImage: ART_SETS.blackbeard,
    pages: {
      1: {
        text: "Novembre 1718. Les eaux peu profondes de l'inlet d'Ocracoke, en Caroline du Nord, sont calmes mais lourdes de menaces. Le lieutenant Robert Maynard, envoyé par le gouverneur de Virginie, commande deux petits sloops non armés de canons : le Jane et le Ranger. Son objectif : capturer ou tuer le célèbre pirate Edward Thache, connu sous le nom de Barbe Noire, à bord de son navire l'Adventure. À l'horizon, Maynard aperçoit le navire pirate ancré dans la brume du matin.",
        illustration: ART_SETS.blackbeard,
        choices: [
          {
            text: "Lancer une attaque frontale audacieuse malgré le manque d'artillerie",
            nextPage: 2,
            relicId: 'slow_match',
            relicName: 'Mèche de Barbe Noire',
            relicIcon: 'Flame',
            relicDesc: "Un fragment de mèche lente en chanvre que Barbe Noire tressait dans sa barbe et allumait pour terrifier ses ennemis."
          },
          {
            text: "Attendre à l'affût la marée haute pour manœuvrer prudemment",
            nextPage: 3,
            relicId: 'fog_whistle',
            relicName: 'Sifflet de Brume',
            relicIcon: 'Compass',
            relicDesc: "Le sifflet en laiton d'Edward Thache, utilisé pour donner ses ordres de pillage à travers le brouillard."
          }
        ]
      },
      2: {
        text: "Maynard ordonne d'avancer. Barbe Noire, surpris mais hilare, fait tirer une bordée dévastatrice de canons chargés de ferraille et de clous. Le Jane subit de lourdes pertes. Pour tromper le pirate, Maynard ordonne à ses hommes survivants de se cacher sous le pont inférieur. Croyant le navire ennemi déserté, Barbe Noire et ses hommes lancent l'abordage. C'est alors que Maynard s'écrie : 'À l'attaque !' et ses hommes surgissent des cales pour un corps-à-corps sanglant. Sur le pont encombré, vous récupérez une mèche lente consumée laissée par le pirate dans sa barbe.",
        illustration: ART_SETS.blackbeard,
        choices: [
          {
            text: "S'engager dans un duel épique au pistolet et sabre contre Thache lui-même",
            nextPage: 4,
            relicId: 'severed_head',
            relicName: "Tête de l'Adventure",
            relicIcon: 'Skull',
            relicDesc: "La preuve irréfutable de la mort de l'effroyable capitaine Edward Thache."
          }
        ]
      },
      3: {
        text: "Vous temporisez, observant les courants complexes des hauts-fonds. Thache tente de s'enfuir par une passe étroite, mais l'Adventure s'échoue momentanément sur un banc de sable. Maynard profite de ce répit pour encercler le navire pirate à l'aide de canots à rames silencieux. Les flibustiers sont pris de court par cette approche furtive. Dans l'affrontement préliminaire, vous mettez la main sur le Sifflet de Brume en laiton d'Edward Thache, utilisé pour coordonner ses hommes dans l'obscurité.",
        illustration: ART_SETS.blackbeard,
        choices: [
          {
            text: "Donner l'assaut final sur le pont supérieur encombré",
            nextPage: 4,
            relicId: 'severed_head',
            relicName: "Tête de l'Adventure",
            relicIcon: 'Skull',
            relicDesc: "La preuve irréfutable de la mort de l'effroyable capitaine Edward Thache."
          }
        ]
      },
      4: {
        text: "Le duel final fait rage entre Maynard et Barbe Noire. Le pirate combat comme un démon, encaissant plusieurs balles et coups de sabre sans faiblir. Finalement, un marin de Maynard frappe Thache à la gorge par-derrière. Le colosse s'effondre enfin, sans vie. Maynard fait trancher la tête de Thache et la suspend au beaupré de son navire pour prouver sa mort et réclamer la récompense. La terreur des Caraïbes n'est plus, mais sa légende est gravée à jamais dans l'histoire de la flibuste.",
        illustration: ART_SETS.blackbeard
      }
    }
  },
  {
    id: 'blackbart',
    title: 'Le Destin du Baron Noir',
    tagline: 'La fin héroïque de Bartholomew Roberts (1722)',
    description: "Suivez l'extraordinaire épopée de Bartholomew Roberts, le pirate mélomane qui captura plus de 400 navires avant son ultime bataille contre la Royal Navy.",
    icon: Compass,
    coverImage: ART_SETS.blackbart,
    pages: {
      1: {
        text: "Février 1722. Au large du Cap Lopez (Gabon moderne), le capitaine Bartholomew Roberts, dit le Baron Noir, savoure un thé chaud dans sa cabine du Royal Fortune. Vêtu d'une magnifique veste de damas rouge et arborant une lourde chaîne d'or ornée d'une croix flamande, il écoute ses musiciens de bord jouer un air de violon. C'est alors que la vigie signale une voile mystérieuse à l'horizon. C'est le HMS Swallow, un puissant vaisseau de ligne de la Royal Navy commandé par Chaloner Ogle, bien décidé à mettre fin au règne de Roberts.",
        illustration: ART_SETS.blackbart,
        choices: [
          {
            text: "Faire voile directement vers le large pour tenter de distancer le navire de guerre",
            nextPage: 2,
            relicId: 'pirate_code',
            relicName: 'Code des Flibustiers',
            relicIcon: 'BookOpen',
            relicDesc: "Le fameux code de conduite dicté par Roberts, interdisant le jeu et imposant l'extinction des bougies à 20h."
          },
          {
            text: "Présenter le flanc et ouvrir le feu avec toute l'artillerie de bord",
            nextPage: 3,
            relicId: 'tea_cup',
            relicName: 'Tasse en Porcelaine',
            relicIcon: 'Anchor',
            relicDesc: "Une précieuse tasse de thé rescapée des appartements cossus du capitaine Roberts."
          }
        ]
      },
      2: {
        text: "Le Royal Fortune vire de bord pour gagner le large. Malheureusement, le vent tourne et un grain tropical ralentit votre course, permettant au HMS Swallow d'approcher à portée de canon. Pour maintenir la discipline au milieu de la panique, vous brandissez la charte originale signée par l'équipage : 'Le Code des Flibustiers', stipulant la part de butin de chacun et l'interdiction des jeux d'argent à bord.",
        illustration: ART_SETS.blackbart,
        choices: [
          {
            text: "Se préparer au choc inévitable de l'affrontement bord à bord",
            nextPage: 4,
            relicId: 'gold_cross',
            relicName: "Croix d'Or de Roberts",
            relicIcon: 'Sparkles',
            relicDesc: "La lourde croix flamande en or massif que Roberts portait fièrement au combat."
          }
        ]
      },
      3: {
        text: "Roberts ordonne de faire feu ! Les canons du Royal Fortune tonnent dans un fracas assourdissant. Le HMS Swallow riposte immédiatement par une décharge de mitraille dévastatrice qui fauche plusieurs marins sur le pont supérieur. Dans la cabine du capitaine fracassée par les boulets, vous découvrez intacte sa tasse de thé en porcelaine royale de Sèvres, un de ses rares luxes terrestres de pirate raffiné.",
        illustration: ART_SETS.blackbart,
        choices: [
          {
            text: "Lancer une contre-attaque désespérée à travers la fumée des canons",
            nextPage: 4,
            relicId: 'gold_cross',
            relicName: "Croix d'Or de Roberts",
            relicIcon: 'Sparkles',
            relicDesc: "La lourde croix flamande en or massif que Roberts portait fièrement au combat."
          }
        ]
      },
      4: {
        text: "Alors qu'il se tient fièrement sur le pont pour galvaniser ses hommes, Bartholomew Roberts est mortellement touché à la gorge par une décharge de mitraille du HMS Swallow. Conformément à ses vœux stricts pour éviter que sa dépouille ne soit capturée, ses hommes en larmes jettent immédiatement son corps par-dessus bord, paré de ses plus beaux habits et de sa magnifique Croix d'Or. À la mort de leur chef charismatique, l'équipage perd tout espoir et se rend. Le Baron Noir disparaît dans les abysses, emportant son élégance éternelle.",
        illustration: ART_SETS.blackbart
      }
    }
  },
  {
    id: 'bonny_read',
    title: 'Les Lionnes de Calico Jack',
    tagline: 'La révolte d\'Anne Bonny & Mary Read (1720)',
    description: "Revivez l'incroyable capture du navire d'Anne Bonny, Mary Read et Jack Rackham, où seules les deux femmes eurent le courage de combattre.",
    icon: Skull,
    coverImage: ART_SETS.bonny_read,
    pages: {
      1: {
        text: "Octobre 1720. À bord du William, ancré au large de Point Negril (Jamaïque), l'équipage de Calico Jack Rackham célèbre ses pillages récents dans une ivresse totale. Seules deux personnes restent vigilantes : Anne Bonny et Mary Read. Déguisées en hommes, sabre au poing et pistolet à la ceinture, elles scrutent la nuit. Soudain, un sloop lourdement armé dirigé par le chasseur de pirates Jonathan Barnet s'approche en silence. Jack et ses hommes, complètement ivres, se réfugient lâchement dans la cale.",
        illustration: ART_SETS.bonny_read,
        choices: [
          {
            text: "Faire face seule sur le pont avec Mary pour repousser l'abordage ennemi",
            nextPage: 2,
            relicId: 'double_pistol',
            relicName: 'Pistolet double de Mary',
            relicIcon: 'Flame',
            relicDesc: "Le pistolet à double canon à silex de Mary Read, célèbre pour sa fureur au combat."
          },
          {
            text: "Tenter de couper la corde de l'ancre pour fuir sous le vent",
            nextPage: 3,
            relicId: 'rum_flask',
            relicName: 'Flacon de Calico Jack',
            relicIcon: 'Coins',
            relicDesc: "La flasque de rhum vide de Calico Jack, symbole de la déchéance tragique de cet équipage autrefois redouté."
          }
        ]
      },
      2: {
        text: "Anne et Mary tirent au pistolet et croisent le fer avec une fureur sauvage contre les soldats de Barnet qui submergent le pont. Furieuses de la lâcheté de leurs propres compagnons, Mary Read tire même à travers l'écoutille de la cale pour forcer les hommes à monter combattre, en criant : 'S'il y a un homme parmi vous, qu'il vienne se battre comme tel !'. Dans le tumulte du combat au corps-à-corps, Mary fait tomber son pistolet double à silex gravé.",
        illustration: ART_SETS.bonny_read,
        choices: [
          {
            text: "Faire face au tribunal royal de Spanish Town",
            nextPage: 4,
            relicId: 'emerald_cameo',
            relicName: "Camée d'Anne Bonny",
            relicIcon: 'Sparkles',
            relicDesc: "Le splendide médaillon d'émeraude que portait Anne Bonny avant de s'évaporer dans la nature."
          }
        ]
      },
      3: {
        text: "Vous tentez une manœuvre désespérée sous les tirs de fusils ennemis pour couper le câble de l'ancre. Les soldats de Barnet lancent des grappins d'abordage et immobilisent le William. Sur le pont encombré de bouteilles de rhum vides, vous ramassez le flacon en étain de Jack Rackham, symbole de la déchéance tragique de cet équipage autrefois redouté.",
        illustration: ART_SETS.bonny_read,
        choices: [
          {
            text: "Faire face au tribunal royal de Spanish Town",
            nextPage: 4,
            relicId: 'emerald_cameo',
            relicName: "Camée d'Anne Bonny",
            relicIcon: 'Sparkles',
            relicDesc: "Le splendide médaillon d'émeraude que portait Anne Bonny avant de s'évaporer dans la nature."
          }
        ]
      },
      4: {
        text: "Capturées et emprisonnées à Spanish Town, Anne Bonny, Mary Read et Jack Rackham sont condamnés à la pendaison. Avant l'exécution de Jack, Anne lui lance cette phrase historique : 'Si vous vous étiez battu comme un homme, vous n'auriez pas à être pendu comme un chien.' Anne et Mary obtiennent un sursis en révélant qu'elles sont enceintes ('We plead our bellies'). Mary meurt de fièvre en prison, mais Anne Bonny disparaît mystérieusement des registres, laissant derrière elle la légende de sa survie.",
        illustration: ART_SETS.bonny_read
      }
    }
  }
];

// Browser SpeechSynthesis Fallback definition
function speakTextBrowser(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.pitch = 0.7; // Deep pirate-like voice
    utterance.rate = 0.85; // Slow deliberate dramatic reading
    window.speechSynthesis.speak(utterance);
    return utterance;
  }
  return null;
}

export default function App() {
  // State management
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const [currentNarrator, setCurrentNarrator] = useState<Narrator>(NARRATORS[0]);
  const [collectedRelics, setCollectedRelics] = useState<Array<{ id: string; name: string; icon: string; desc: string }>>([]);
  
  // Ambient Sound Engine (Web Audio API Synthesizer)
  const [isAmbientSoundOn, setIsAmbientSoundOn] = useState<boolean>(false);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);
  
  // Voice engine & Edge Voices configuration
  const [voiceEngine, setVoiceEngine] = useState<'gemini' | 'edge'>('gemini');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  // Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>('');
  const [pirateTag, setPirateTag] = useState<string>(() => localStorage.getItem('pirate_tag') || 'BarbeNoire');
  const [supabaseStatus, setSupabaseStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string>('');
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);

  // Narration AI Voice playback
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [narrationError, setNarrationError] = useState<string | null>(null);
  
  // Refs for audio nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const windNodeRef = useRef<ScriptProcessorNode | null>(null);
  const seaNodeRef = useRef<ScriptProcessorNode | null>(null);
  const windFilterRef = useRef<BiquadFilterNode | null>(null);
  const windGainRef = useRef<GainNode | null>(null);
  const seaFilterRef = useRef<BiquadFilterNode | null>(null);
  const seaGainRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const activeAudioPlaybackRef = useRef<HTMLAudioElement | null>(null);
  
  // Load browser speechSynthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // filter french voices mainly, fallback to any
        const frVoices = voices.filter(v => v.lang.startsWith('fr') || v.lang.startsWith('FR'));
        setAvailableVoices(frVoices.length > 0 ? frVoices : voices);
        if (frVoices.length > 0 && !selectedVoiceURI) {
          setSelectedVoiceURI(frVoices[0].voiceURI);
        } else if (voices.length > 0 && !selectedVoiceURI) {
          setSelectedVoiceURI(voices[0].voiceURI);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Check and setup Supabase initial connection
  useEffect(() => {
    const creds = getSupabaseCredentials();
    setSupabaseUrl(creds.url);
    setSupabaseAnonKey(creds.anonKey);
    if (creds.url && creds.anonKey) {
      testSupabaseConnection(creds.url, creds.anonKey);
    }
  }, []);

  const testSupabaseConnection = async (url: string, key: string) => {
    setSupabaseStatus('disconnected');
    if (!url || !key) return;
    try {
      // Save temp credentials to test
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_anon_key', key);
      
      const client = getSupabaseClient();
      if (client) {
        // Query metadata to check connection
        const { error } = await client.from('pirate_progress').select('count', { count: 'exact', head: true });
        if (error) {
          if (error.message.includes('relation "pirate_progress" does not exist')) {
            setSupabaseStatus('connected');
            setSyncFeedback("Connecté à Supabase ! Pour sauvegarder, créez la table 'pirate_progress' avec le script SQL ci-dessous.");
          } else {
            setSupabaseStatus('error');
            setSyncFeedback(`Erreur Supabase : ${error.message}`);
          }
        } else {
          setSupabaseStatus('connected');
          setSyncFeedback("Connexion Supabase active et table trouvée !");
          // Attempt to auto-load progress
          if (pirateTag) {
            handleLoadProgress(pirateTag);
          }
        }
      }
    } catch (e: any) {
      setSupabaseStatus('error');
      setSyncFeedback(`Échec de connexion : ${e.message}`);
    }
  };

  const handleSaveProgress = async (storyId: string, pageNum: number, relicsList = collectedRelics) => {
    if (!storyId) return;
    setIsSyncing(true);
    setSyncFeedback("Verrouillage de votre carnet de bord...");

    const progressObj: PirateProgress = {
      current_story_id: storyId,
      current_page_num: pageNum,
      relics_json: JSON.stringify(relicsList),
      ambient_volume: ambientVolume,
      voice_engine: voiceEngine,
      narrator_id: currentNarrator.id,
      user_tag: pirateTag
    };

    // Save locally
    localStorage.setItem(`pirate_progress_local_${pirateTag}`, JSON.stringify(progressObj));
    localStorage.setItem('pirate_tag', pirateTag);

    // Save to Supabase
    const result = await saveProgressToSupabase(progressObj);
    setIsSyncing(false);
    if (result.success) {
      setSyncFeedback("Carnet de bord sauvegardé dans Supabase ! 🏴‍☠️");
    } else {
      setSyncFeedback(`Mémoire locale mise à jour. (Pas de sync : ${result.error || 'Vérifiez la table pirate_progress'})`);
    }
  };

  const handleLoadProgress = async (tagToLoad: string) => {
    if (!tagToLoad) return;
    setIsSyncing(true);
    setSyncFeedback(`Recherche du livre de bord de ${tagToLoad}...`);
    localStorage.setItem('pirate_tag', tagToLoad);

    // Try Supabase loading
    const data = await loadProgressFromSupabase(tagToLoad);
    if (data) {
      const story = STORIES.find(s => s.id === data.current_story_id);
      if (story) {
        setSelectedStory(story);
        setCurrentPageNum(data.current_page_num);
        try {
          const loadedRelics = JSON.parse(data.relics_json);
          setCollectedRelics(loadedRelics);
        } catch (e) {
          console.warn("Could not parse loaded relics JSON:", e);
        }
        setVoiceEngine(data.voice_engine || 'gemini');
        const narrator = NARRATORS.find(n => n.id === data.narrator_id);
        if (narrator) setCurrentNarrator(narrator);
        setAmbientVolume(data.ambient_volume || 0.5);
        setHasStarted(true);
        setSyncFeedback(`Carnet de bord "${tagToLoad}" récupéré depuis les abysses de Supabase !`);
      } else {
        setSyncFeedback("Données Supabase corrompues ou inconnues.");
      }
    } else {
      // Try local storage fallback
      const localDataStr = localStorage.getItem(`pirate_progress_local_${tagToLoad}`);
      if (localDataStr) {
        try {
          const localData = JSON.parse(localDataStr) as PirateProgress;
          const story = STORIES.find(s => s.id === localData.current_story_id);
          if (story) {
            setSelectedStory(story);
            setCurrentPageNum(localData.current_page_num);
            const loadedRelics = JSON.parse(localData.relics_json);
            setCollectedRelics(loadedRelics);
            setVoiceEngine(localData.voice_engine || 'gemini');
            const narrator = NARRATORS.find(n => n.id === localData.narrator_id);
            if (narrator) setCurrentNarrator(narrator);
            setAmbientVolume(localData.ambient_volume || 0.5);
            setHasStarted(true);
            setSyncFeedback(`Chargé localement. Aucun parchemin Supabase trouvé pour "${tagToLoad}".`);
          }
        } catch (e) {
          setSyncFeedback("Erreur de décodage local.");
        }
      } else {
        setSyncFeedback(`Aucun carnet trouvé pour "${tagToLoad}". Prêt à démarrer une nouvelle épopée.`);
      }
    }
    setIsSyncing(false);
  };

  const handleSaveCredentials = () => {
    saveSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    testSupabaseConnection(supabaseUrl, supabaseAnonKey);
  };

  const handleClearCredentials = () => {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_anon_key');
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setSupabaseStatus('disconnected');
    setSyncFeedback('Configuration Supabase réinitialisée.');
  };

  // Initialize and adjust ambient sound
  useEffect(() => {
    if (isAmbientSoundOn) {
      startAmbientSynth();
    } else {
      stopAmbientSynth();
    }
    return () => {
      stopAmbientSynth();
    };
  }, [isAmbientSoundOn]);

  useEffect(() => {
    if (windGainRef.current) {
      windGainRef.current.gain.setValueAtTime(0.06 * ambientVolume, audioCtxRef.current?.currentTime || 0);
    }
    if (seaGainRef.current) {
      seaGainRef.current.gain.setValueAtTime(0.12 * ambientVolume, audioCtxRef.current?.currentTime || 0);
    }
  }, [ambientVolume]);

  // Clean voice narration on story/page transitions
  useEffect(() => {
    stopNarration();
  }, [selectedStory, currentPageNum]);

  // Synthesize realistic ambient sea & wind noises natively
  const startAmbientSynth = () => {
    try {
      if (audioCtxRef.current) return; // already active

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      const bufferSize = 4096;

      // 1. Wind synthesis
      const windNode = ctx.createScriptProcessor(bufferSize, 1, 1);
      windNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1; // white noise
        }
      };
      windNodeRef.current = windNode;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.Q.value = 4.0;
      windFilter.frequency.value = 450;
      windFilterRef.current = windFilter;

      const windGain = ctx.createGain();
      windGain.gain.value = 0.06 * ambientVolume;
      windGainRef.current = windGain;

      // Connect Wind
      windNode.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(ctx.destination);

      // Slow LFO to swing wind sound to simulate gusts
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.07; // ultra slow frequency
      lfoRef.current = lfo;

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 250; // swing filters by 250Hz

      lfo.connect(lfoGain);
      lfoGain.connect(windFilter.frequency);
      lfo.start();

      // 2. Sea crashing wave sounds
      const seaNode = ctx.createScriptProcessor(bufferSize, 1, 1);
      seaNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      };
      seaNodeRef.current = seaNode;

      const seaFilter = ctx.createBiquadFilter();
      seaFilter.type = 'lowpass';
      seaFilter.frequency.value = 160;
      seaFilterRef.current = seaFilter;

      const seaGain = ctx.createGain();
      seaGain.gain.value = 0.12 * ambientVolume;
      seaGainRef.current = seaGain;

      seaNode.connect(seaFilter);
      seaFilter.connect(seaGain);
      seaGain.connect(ctx.destination);

      // Wave swell looping function
      const modulateWaves = () => {
        if (!audioCtxRef.current || !seaGainRef.current || !seaFilterRef.current) return;
        const now = audioCtxRef.current.currentTime;
        
        // Randomly sweep waves to sound like sea water rising and crashing on beach
        seaGainRef.current.gain.setValueAtTime(0.03 * ambientVolume, now);
        seaGainRef.current.gain.exponentialRampToValueAtTime(0.25 * ambientVolume, now + 3);
        seaGainRef.current.gain.exponentialRampToValueAtTime(0.03 * ambientVolume, now + 7.5);

        seaFilterRef.current.frequency.setValueAtTime(120, now);
        seaFilterRef.current.frequency.exponentialRampToValueAtTime(380, now + 3);
        seaFilterRef.current.frequency.exponentialRampToValueAtTime(120, now + 7.5);

        setTimeout(() => {
          if (audioCtxRef.current) modulateWaves();
        }, 9000 + Math.random() * 4000);
      };

      modulateWaves();

    } catch (err) {
      console.error("Failed to compile Web Audio synth:", err);
    }
  };

  const stopAmbientSynth = () => {
    try {
      if (lfoRef.current) {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
        lfoRef.current = null;
      }
      if (windNodeRef.current) {
        windNodeRef.current.disconnect();
        windNodeRef.current = null;
      }
      if (windFilterRef.current) {
        windFilterRef.current.disconnect();
        windFilterRef.current = null;
      }
      if (windGainRef.current) {
        windGainRef.current.disconnect();
        windGainRef.current = null;
      }
      if (seaNodeRef.current) {
        seaNodeRef.current.disconnect();
        seaNodeRef.current = null;
      }
      if (seaFilterRef.current) {
        seaFilterRef.current.disconnect();
        seaFilterRef.current = null;
      }
      if (seaGainRef.current) {
        seaGainRef.current.disconnect();
        seaGainRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {
      console.warn("Error cleaning up audio synthesis nodes:", e);
    }
  };

  // Play narration via Gemini server API or Local SpeechSynthesis
  const handleNarratePage = async (text: string) => {
    if (isNarrating) {
      stopNarration();
      return;
    }

    setIsNarrating(true);
    setNarrationError(null);

    if (voiceEngine === 'edge') {
      try {
        if (!('speechSynthesis' in window)) {
          throw new Error("Votre navigateur ne supporte pas la synthèse vocale Edge/Locale.");
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try finding selected voice
        const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoiceURI);
        if (voice) {
          utterance.voice = voice;
        } else {
          utterance.lang = 'fr-FR';
        }
        
        utterance.pitch = 0.7; // Lowered deep pitch
        utterance.rate = 0.85;  // Slow, atmospheric

        utterance.onend = () => {
          setIsNarrating(false);
        };
        utterance.onerror = (e) => {
          console.error("SpeechSynthesis error:", e);
          setIsNarrating(false);
          setNarrationError("La synthèse vocale locale Edge a rencontré un écueil.");
        };

        window.speechSynthesis.speak(utterance);
      } catch (err: any) {
        setIsNarrating(false);
        setNarrationError(`Échec de la synthèse vocale : ${err.message}`);
      }
    } else {
      // PREMIUM GEMINI API
      try {
        const response = await fetch('/api/narrate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            voiceName: currentNarrator.voiceName
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "La connexion avec la vigie a échoué.");
        }

        const data = await response.json();
        if (!data.audio) {
          throw new Error("L'IA n'a pas retourné de piste audio.");
        }

        const binary = atob(data.audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        
        const audio = new Audio(audioUrl);
        activeAudioPlaybackRef.current = audio;
        
        audio.onended = () => {
          setIsNarrating(false);
        };

        audio.onerror = () => {
          throw new Error("Erreur de décodage audio du flibustier.");
        };

        await audio.play();

      } catch (err: any) {
        console.warn("AI Voice failed or key missing. Falling back to Browser TTS...", err);
        setNarrationError("Moteur Gemini indisponible ou clé absente. Basculement sur la voix Edge/Locale...");
        
        // Fallback to local
        const utterance = speakTextBrowser(text);
        if (utterance) {
          utterance.onend = () => {
            setIsNarrating(false);
          };
          utterance.onerror = () => {
            setIsNarrating(false);
          };
        } else {
          setIsNarrating(false);
          setNarrationError("Aucun moyen de narration audio n'est supporté.");
        }
      }
    }
  };

  const stopNarration = () => {
    if (activeAudioPlaybackRef.current) {
      activeAudioPlaybackRef.current.pause();
      activeAudioPlaybackRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsNarrating(false);
  };

  // Select a choice & advance story + add relic to inventory & sync
  const handleSelectChoice = (choice: Choice) => {
    let nextRelics = [...collectedRelics];
    if (choice.relicId && !collectedRelics.some(r => r.id === choice.relicId)) {
      nextRelics = [
        ...nextRelics, 
        { 
          id: choice.relicId, 
          name: choice.relicName, 
          icon: choice.relicIcon,
          desc: choice.relicDesc
        }
      ];
      setCollectedRelics(nextRelics);
    }
    setCurrentPageNum(choice.nextPage);
    if (selectedStory) {
      handleSaveProgress(selectedStory.id, choice.nextPage, nextRelics);
    }
  };

  // Reset progress and sail again
  const handleRestartStory = () => {
    setCurrentPageNum(1);
    stopNarration();
    if (selectedStory) {
      handleSaveProgress(selectedStory.id, 1, collectedRelics);
    }
  };

  // Reset entire chest and app
  const handleFullReset = () => {
    setSelectedStory(null);
    setCurrentPageNum(1);
    setCollectedRelics([]);
    stopNarration();
    setHasStarted(false);
  };

  // Utility to map dynamic relic icons to React components
  const renderRelicIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Skull': return <Skull className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Coins': return <Coins className={className} />;
      default: return <Anchor className={className} />;
    }
  };

  // Retrieve current active page data
  const currentPage: PageData | undefined = selectedStory?.pages[currentPageNum];

  return (
    <div id="app-container" className="min-h-screen w-full flex flex-col items-center justify-between text-[#e2d8be] select-none font-garamond bg-[#06070a] relative overflow-hidden">
      
      {/* Background drifting mist & moody atmospheric layers */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-t from-[#0d0f17] via-[#040507] to-[#020304]" />
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-color-burn opacity-15 filter blur-[2px] animate-ocean scale-105"
          style={{ backgroundImage: `url(${ART_SETS.cover})` }}
        />
        {/* Animated Mist Layers */}
        <div className="absolute inset-x-0 bottom-0 h-96 opacity-30 bg-gradient-to-t from-[#0e1017] to-transparent mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_#06070a_95%)]" />
      </div>

      {/* PERSISTENT HEADER BAR */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-[#2c271b]/40 z-20 backdrop-blur-md bg-[#07080c]/50">
        <div className="flex items-center gap-3">
          <Anchor className="w-6 h-6 text-[#c4b182] animate-pulse" />
          <h1 
            onClick={handleFullReset}
            className="font-cinzel-dec tracking-wider text-xl md:text-2xl font-bold cursor-pointer text-[#e4d6b3] hover:text-white transition-colors duration-300"
          >
            L'Écho du Flibustier
          </h1>
        </div>

        {/* Dynamic Controls Panel */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Supabase Status Button */}
          <button 
            onClick={() => setShowConfigPanel(prev => !prev)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-cinzel transition-all duration-300 ${
              supabaseStatus === 'connected' 
                ? 'bg-[#0f1f1a]/90 border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/20' 
                : supabaseStatus === 'error'
                  ? 'bg-[#271012]/90 border-rose-500/40 text-rose-400 hover:bg-rose-950/20'
                  : 'bg-[#12141c]/80 border-[#2c271b]/60 text-gray-400 hover:text-white hover:border-[#c4b182]'
            }`}
            title="Cale Secrète - Configuration Supabase"
          >
            <Database className="w-4 h-4 animate-pulse" />
            <span className="hidden md:inline">Registre Supabase</span>
            <span className={`w-2 h-2 rounded-full ${
              supabaseStatus === 'connected' 
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' 
                : supabaseStatus === 'error'
                  ? 'bg-rose-400 shadow-[0_0_8px_#f87171]'
                  : 'bg-gray-600'
            }`} />
          </button>

          {/* Ambient Soundscape Controller */}
          <div className="flex items-center gap-2 bg-[#12141c]/80 border border-[#2c271b]/60 px-3 py-1.5 rounded-md">
            <button 
              onClick={() => setIsAmbientSoundOn(prev => !prev)}
              title={isAmbientSoundOn ? "Désactiver le son de la mer" : "Activer l'ambiance sonore du large"}
              className="p-1 hover:text-[#c4b182] transition-colors"
            >
              {isAmbientSoundOn ? (
                <Waves className="w-5 h-5 text-cyan-400 animate-pulse" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {isAmbientSoundOn && (
              <div className="flex items-center gap-2 transition-all duration-300">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="w-16 md:w-20 accent-[#c4b182] bg-[#222] h-1 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] uppercase tracking-widest text-[#a89d7e] font-cinzel">Le Large</span>
              </div>
            )}
          </div>

          {/* Ocean Voyage Info or Back to fleet button */}
          {selectedStory && (
            <button 
              onClick={handleFullReset}
              className="text-xs uppercase tracking-widest font-cinzel px-4 py-2 border border-[#c4b182]/40 hover:border-[#c4b182] hover:bg-[#c4b182]/10 transition-all rounded"
            >
              Retour au Port
            </button>
          )}
        </div>
      </header>

      {/* EXPANDABLE SUPABASE DRAWER / CONFIGURATION DRAWER */}
      {showConfigPanel && (
        <div className="w-full max-w-7xl mx-auto px-6 py-6 border-b border-[#3e3422]/40 bg-[#090b10] z-20 animate-fade-in text-[#bfae8a]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Supabase inputs */}
            <div className="lg:col-span-5 bg-[#12141c]/90 border border-[#2c271b]/60 p-5 rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-xs uppercase tracking-wider text-white font-bold flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#c4b182]" />
                  Registre de Contrebande (Supabase)
                </h3>
                {supabaseStatus === 'connected' && (
                  <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">Actif</span>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Identifiant Pirate (Tag de Sauvegarde)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ex: BarbeNoire, L'Écorcheur..." 
                      value={pirateTag}
                      onChange={(e) => setPirateTag(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                      className="flex-1 bg-black/40 border border-[#3e3422]/60 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#c4b182] rounded"
                    />
                    <button 
                      onClick={() => handleLoadProgress(pirateTag)}
                      className="px-3 py-1.5 bg-[#c4b182]/15 hover:bg-[#c4b182]/30 border border-[#c4b182]/40 text-xs font-cinzel text-white rounded transition-colors"
                      title="Rechercher cette sauvegarde dans la cale"
                    >
                      Charger
                    </button>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 block">Renseignez votre pseudonyme de pirate pour enregistrer/charger vos reliques et chapitres de l'épopée.</span>
                </div>

                <div className="border-t border-[#2c271b]/40 my-3 pt-3">
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Supabase Project URL</label>
                  <input 
                    type="text" 
                    placeholder="https://xxxxxx.supabase.co" 
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full bg-black/40 border border-[#3e3422]/60 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#c4b182] rounded"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Supabase Anon Key</label>
                  <input 
                    type="password" 
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    className="w-full bg-black/40 border border-[#3e3422]/60 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#c4b182] rounded"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleSaveCredentials}
                  disabled={!supabaseUrl || !supabaseAnonKey}
                  className="flex-1 py-2 bg-[#c4b182] hover:bg-[#ab9768] text-[#06070a] font-cinzel font-bold text-xs uppercase rounded transition-all disabled:opacity-30 disabled:pointer-events-none text-center"
                >
                  S'amarrer à Supabase
                </button>
                <button 
                  onClick={handleClearCredentials}
                  className="px-3 py-2 bg-black/40 hover:bg-black/80 border border-gray-800 text-xs text-gray-400 hover:text-white rounded transition-all"
                  title="Déconnecter"
                >
                  Effacer
                </button>
              </div>

              {syncFeedback && (
                <div className="bg-black/30 border border-[#2c271b]/40 rounded p-2.5 text-[11px] font-mono leading-relaxed text-amber-200/90 flex gap-2 items-start">
                  <Activity className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#c4b182] animate-pulse" />
                  <span>{syncFeedback}</span>
                </div>
              )}
            </div>

            {/* Supabase Quick Guide with database schema command */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#12141c]/40 border border-[#2c271b]/40 p-5 rounded-md">
                <h4 className="font-cinzel text-xs uppercase tracking-wider text-[#c4b182] font-bold mb-2">Instructions d'amarrage</h4>
                <p className="text-xs text-[#a1967a] leading-relaxed mb-3">
                  Pour stocker de façon pérenne votre collection de reliques et votre avancée à travers les mers, créez une table dans votre console SQL Supabase grâce à l'incantation magique ci-dessous :
                </p>

                <div className="relative group">
                  <pre className="bg-[#06070a] border border-[#222]/80 rounded p-3 text-[10px] font-mono text-cyan-300 overflow-x-auto max-h-40 leading-relaxed scrollbar-thin">
{`create table pirate_progress (
  user_tag text primary key,
  current_story_id text not null,
  current_page_num integer not null,
  relics_json text not null,
  ambient_volume float not null default 0.5,
  voice_engine text not null default 'gemini',
  narrator_id text not null default 'charon',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);`}
                  </pre>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] bg-[#12141c] text-[#c4b182] border border-[#3e3422] px-2 py-1 rounded">SQL Table</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-3 text-[11px] text-[#8c8266] italic leading-snug bg-black/25 p-3 rounded border border-dashed border-[#2c271b]">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Chaque action critique (obtenir une relique, tourner une page ou réinitialiser l'aventure) déclenchera une écriture instantanée dans cette table. Le livre se recharge tout seul dès votre arrivée au port !
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CORE APPLICATION CONTAINER */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col items-center justify-center p-4 md:p-6 z-10">
        
        {/* LAUNCH / GATEWAY COVER SCREEN */}
        {!hasStarted && (
          <div className="w-full max-w-4xl py-12 px-6 flex flex-col items-center text-center z-10 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/5 rounded-full filter blur-[100px] pointer-events-none" />
            
            <div className="p-3 border border-[#3c3423] rounded-full bg-[#12141c]/80 animate-lantern mb-6">
              <Skull className="w-14 h-14 text-[#c4b182] animate-glow-pulse" />
            </div>

            <h2 className="font-cinzel-dec text-4xl md:text-6xl font-black tracking-wider text-[#e6dbbf] mb-4">
              PRENDRE LA MER
            </h2>
            
            <p className="max-w-2xl text-lg md:text-xl text-[#b5aa8b] leading-relaxed font-garamond italic mb-8">
              "L'immersion commence ici, voyageur. Ajustez vos haut-parleurs. Sentez l'humidité du salpêtre et écoutez les murmures maudits de l'océan..."
            </p>

            {/* Sound setup warning for first-time callers */}
            <div className="bg-[#12141e]/90 border border-[#3e3522]/60 rounded-lg p-5 max-w-xl mb-10 backdrop-blur">
              <div className="flex items-start gap-3 text-left">
                <Info className="w-5 h-5 text-[#c4b182] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-cinzel text-xs uppercase tracking-widest font-bold text-[#c4b182] mb-1">Ambiance active</h4>
                  <p className="text-xs text-[#a3977a] leading-relaxed">
                    Cette application synthétise dynamiquement les bruits du vent et des vagues en temps réel via l'API Web Audio de votre navigateur. Activez les sons à tout moment via les commandes du haut de page.
                  </p>
                </div>
              </div>
            </div>

            {/* EMBARK BUTTON */}
            <button
              id="embark-btn"
              onClick={() => {
                setHasStarted(true);
                setIsAmbientSoundOn(true); // Auto trigger soundscape for immersion
              }}
              className="relative group px-12 py-5 border-2 border-[#c4b182] overflow-hidden rounded bg-[#13151f] hover:bg-[#c4b182]/5 shadow-lg shadow-amber-950/20 active:scale-95 transition-all duration-300"
            >
              <span className="absolute inset-0 w-full h-full bg-[#c4b182] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out opacity-10" />
              <span className="font-cinzel text-lg tracking-widest font-bold text-[#e6dbbf] group-hover:text-white transition-colors">
                SIGNER LE RÔLE D'ÉQUIPAGE
              </span>
            </button>
          </div>
        )}

        {/* TALE SELECTION PLATFORM */}
        {hasStarted && !selectedStory && (
          <div className="w-full py-8 max-w-6xl animate-fade-in">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-[0.2em] text-[#c4b182] font-cinzel font-semibold">Registre des Légendes</span>
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold mt-1 text-white">CHOISISSEZ VOTRE AVENTURE</h2>
              <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#c4b182]/60 to-transparent mx-auto mt-4" />
            </div>

            {/* GRID OF SACRED STORIES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STORIES.map(story => {
                const StoryIcon = story.icon;
                return (
                  <div 
                    key={story.id}
                    id={`story-card-${story.id}`}
                    onClick={() => {
                      setSelectedStory(story);
                      setCurrentPageNum(1);
                    }}
                    className="relative group border border-[#2c271b] hover:border-[#c4b182]/60 rounded-lg overflow-hidden cursor-pointer bg-[#0f1118]/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/60"
                  >
                    {/* Atmospheric Preview background */}
                    <div className="relative h-48 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-all duration-300 z-10" />
                      <img 
                        src={story.coverImage} 
                        alt={story.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 z-20 p-2 bg-black/75 border border-[#c4b182]/30 rounded-full">
                        <StoryIcon className="w-5 h-5 text-[#c4b182]" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 relative">
                      <span className="text-[10px] tracking-widest font-cinzel text-[#c4b182] uppercase block mb-1">
                        {story.tagline}
                      </span>
                      <h3 className="font-cinzel text-xl font-bold text-white group-hover:text-[#c4b182] transition-colors mb-2">
                        {story.title}
                      </h3>
                      <p className="text-[#a3977a] text-sm leading-relaxed mb-4">
                        {story.description}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2c271b]/40">
                        <span className="text-[10px] font-mono tracking-widest text-[#726a51] uppercase">Prendre les voiles</span>
                        <ChevronRight className="w-4 h-4 text-[#c4b182] group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CHEST OF SECURED RELICS AND COINS */}
            <div className="mt-16 bg-[#0f1118]/60 border border-[#2c271b]/40 rounded-lg p-6 max-w-4xl mx-auto">
              <h3 className="font-cinzel text-xs tracking-widest text-[#c4b182] uppercase text-center mb-6">
                ~ Coffre Fort aux Reliques de Mer ~
              </h3>

              {collectedRelics.length === 0 ? (
                <div className="text-center py-6 text-sm text-[#726a51] italic font-garamond">
                  "Votre coffre est vide. Signez une aventure et faites des choix cruciaux pour récupérer des reliques divines."
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {collectedRelics.map(relic => (
                    <div 
                      key={relic.id} 
                      className="flex flex-col items-center text-center p-3 border border-[#3e3422]/60 bg-[#151720]/80 rounded relative group"
                    >
                      <div className="p-3 border border-[#c4b182]/40 rounded-full bg-[#1e212d] mb-2 text-[#c4b182]">
                        {renderRelicIcon(relic.icon, "w-6 h-6 animate-glow-pulse")}
                      </div>
                      <span className="text-xs font-cinzel font-bold text-white block truncate w-full">
                        {relic.name}
                      </span>
                      
                      {/* Floating hover description */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded bg-black/95 text-left text-xs border border-[#c4b182] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50">
                        <p className="font-cinzel text-[#c4b182] font-semibold mb-1 uppercase tracking-wide">{relic.name}</p>
                        <p className="text-[#a89d7e] leading-snug">{relic.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE BOOK READING STAGE */}
        {selectedStory && currentPage && (
          <div className="w-full max-w-6xl animate-fade-in py-4 flex flex-col items-center">
            
            {/* BOOK LAYOUT: Splitted into Left (Visual & Relics) and Right (Parchment Story) */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#090b10] border border-[#2c271b]/40 rounded-lg shadow-2xl shadow-black overflow-hidden relative">
              
              {/* BOOK MIDDLE SEPARATION SPINE */}
              <div className="hidden lg:block absolute top-0 bottom-0 left-[41.666667%] w-[2px] bg-gradient-to-b from-transparent via-[#2c271b]/80 to-transparent z-20 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,1)]" />

              {/* LEFT PAGE: Atmospheric Cinematic Canvas & Narrator Setup */}
              <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#2c271b]/40 bg-[#0d0f17]/90 min-h-[400px] lg:min-h-[580px] p-6 relative">
                
                {/* Vintage overlay glow */}
                <div className="absolute top-6 left-6 w-32 h-32 bg-[#c4b182]/5 rounded-full filter blur-[40px] pointer-events-none" />

                {/* Cover Frame */}
                <div className="w-full flex-1 flex flex-col justify-center gap-6 z-10">
                  <div className="text-center lg:text-left">
                    <span className="text-[10px] tracking-widest font-cinzel text-[#c4b182] uppercase">
                      Légende Marine Actuelle
                    </span>
                    <h3 className="font-cinzel text-xl md:text-2xl font-bold text-white mt-1 leading-tight">
                      {selectedStory.title}
                    </h3>
                  </div>

                  {/* High Quality Story Image */}
                  <div className="relative border border-[#2c271b] shadow-xl overflow-hidden rounded group aspect-video">
                    <div className="absolute inset-0 bg-amber-950/10 mix-blend-color z-10 pointer-events-none" />
                    <img 
                      src={currentPage.illustration} 
                      alt={selectedStory.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute bottom-2 right-2 z-10 px-3 py-1 bg-black/80 border border-[#c4b182]/30 text-[10px] font-mono rounded text-[#c4b182] tracking-wider uppercase">
                      Page {currentPageNum}
                    </div>
                  </div>
                </div>

                {/* VOICE ENGINE CHANGER & SELECTOR CONTROLS */}
                <div className="mt-8 pt-6 border-t border-[#2c271b]/40 z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#c4b182]" />
                      <h4 className="font-cinzel text-xs uppercase tracking-widest font-bold text-[#c4b182]">
                        Moteur de Lecture Audio
                      </h4>
                    </div>
                  </div>

                  {/* Engine Switch Tabs */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 border border-[#2c271b]/40 rounded-md">
                    <button
                      onClick={() => {
                        setVoiceEngine('gemini');
                        stopNarration();
                      }}
                      className={`py-1.5 px-3 rounded text-xs font-cinzel transition-all ${
                        voiceEngine === 'gemini'
                          ? 'bg-[#c4b182]/20 text-white border border-[#c4b182]/50'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                        Gemini (IA Nuage)
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setVoiceEngine('edge');
                        stopNarration();
                      }}
                      className={`py-1.5 px-3 rounded text-xs font-cinzel transition-all ${
                        voiceEngine === 'edge'
                          ? 'bg-[#c4b182]/20 text-white border border-[#c4b182]/50'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-amber-400" />
                        Edge (Local)
                      </span>
                    </button>
                  </div>

                  {voiceEngine === 'gemini' ? (
                    /* GEMINI PREMIUM NARRATORS */
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase tracking-widest text-gray-400 block">Voix off de la taverne :</span>
                      <div className="grid grid-cols-2 gap-2">
                        {NARRATORS.map(narrator => {
                          const isActive = currentNarrator.id === narrator.id;
                          return (
                            <button 
                              key={narrator.id}
                              onClick={() => {
                                setCurrentNarrator(narrator);
                                stopNarration();
                              }}
                              className={`text-left p-2 rounded border text-xs transition-all ${
                                isActive 
                                  ? `${narrator.color} border-[#c4b182]` 
                                  : 'bg-black/30 border-[#2c271b]/50 text-gray-400 hover:text-white hover:border-[#3d3725]'
                              }`}
                            >
                              <p className="font-cinzel font-bold text-[11px]">{narrator.name}</p>
                              <p className="text-[9px] text-[#8e8468] truncate">{narrator.title}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* EDGE LOCAL SPEECH SYNTHESIS VOICES */
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-gray-400 block">Voix de bord disponibles (Edge/Chrome) :</label>
                      <select
                        value={selectedVoiceURI}
                        onChange={(e) => {
                          setSelectedVoiceURI(e.target.value);
                          stopNarration();
                        }}
                        className="w-full bg-black/60 border border-[#2c271b]/60 px-3 py-2 rounded text-xs text-[#e2d8be] font-mono focus:outline-none focus:border-[#c4b182]"
                      >
                        {availableVoices.length === 0 ? (
                          <option>Pas de voix système trouvée</option>
                        ) : (
                          availableVoices.map(voice => (
                            <option key={voice.voiceURI} value={voice.voiceURI}>
                              {voice.name} ({voice.lang})
                            </option>
                          ))
                        )}
                      </select>
                      <span className="text-[9px] text-amber-200/60 block leading-snug">
                        Le moteur Edge utilise l'API de synthèse de votre système pour raconter la légende à bord de votre navire sans aucune connexion requise.
                      </span>
                    </div>
                  )}
                </div>

                {/* COLLECTED STAGE ITEMS IN CHEST */}
                <div className="mt-6 pt-4 border-t border-[#2c271b]/40">
                  <span className="text-[10px] tracking-widest font-cinzel text-[#a89d7e] uppercase block mb-2">
                    Coffre de Reliques de cette traversée :
                  </span>
                  <div className="flex gap-2">
                    {collectedRelics.length === 0 ? (
                      <span className="text-[11px] font-garamond text-gray-500 italic">Vide... faites des choix à droite pour acquérir des artefacts.</span>
                    ) : (
                      collectedRelics.map(relic => (
                        <div 
                          key={relic.id} 
                          title={`${relic.name} : ${relic.desc}`}
                          className="p-1.5 border border-[#c4b182]/30 bg-black/50 rounded-full text-[#c4b182] hover:border-[#c4b182] transition-colors"
                        >
                          {renderRelicIcon(relic.icon, "w-4 h-4 animate-glow-pulse")}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT PAGE: Aged Parchment text container & Interactive choices */}
              <div className="lg:col-span-7 flex flex-col justify-between p-8 md:p-12 relative parchment-texture text-[#241f15] min-h-[480px]">
                
                {/* Antique corners decoration */}
                <div className="absolute top-4 left-4 border-t border-l border-[#241f15]/30 w-8 h-8 pointer-events-none" />
                <div className="absolute top-4 right-4 border-t border-r border-[#241f15]/30 w-8 h-8 pointer-events-none" />
                <div className="absolute bottom-4 left-4 border-b border-l border-[#241f15]/30 w-8 h-8 pointer-events-none" />
                <div className="absolute bottom-4 right-4 border-b border-r border-[#241f15]/30 w-8 h-8 pointer-events-none" />

                {/* HEADER / STORY META */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#241f15]/20">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#3d3320]" />
                    <span className="font-cinzel text-xs tracking-wider uppercase text-[#3d3320] font-bold">
                      {selectedStory.title}
                    </span>
                  </div>
                  <span className="font-cinzel text-xs uppercase tracking-widest text-[#5e4f35]">
                    Page {currentPageNum}
                  </span>
                </div>

                {/* THE STORY TEXT CONTENT (EB GARAMOND IMMERSIVE) */}
                <div className="flex-1 flex flex-col justify-center relative my-4">
                  
                  {/* Drop cap letter decoration */}
                  <div className="text-xl md:text-2xl leading-relaxed text-[#241f15] font-garamond relative">
                    {/* Generates a nice dropcap letter for the first letter of page */}
                    <span className="float-left text-5xl font-cinzel-dec font-black pr-3 pt-1 text-[#4e3f28] select-none">
                      {currentPage.text.charAt(0)}
                    </span>
                    {currentPage.text.slice(1)}
                  </div>

                  {/* Narrate This Paragraph Button */}
                  <div className="mt-8 flex items-center justify-between bg-[#1d1911]/5 border border-[#2d271a]/15 rounded p-3">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-[#3e3422]" />
                      <span className="text-[11px] font-cinzel text-[#3e3422] uppercase font-bold">
                        {voiceEngine === 'gemini' 
                          ? `Écouter avec Gemini (${currentNarrator.name})` 
                          : 'Écouter avec la synthèse Edge locale'}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleNarratePage(currentPage.text)}
                      className={`px-4 py-2 text-xs uppercase tracking-widest font-cinzel font-bold border rounded transition-all flex items-center gap-2 ${
                        isNarrating 
                          ? 'bg-[#312513] text-white border-[#312513] animate-pulse' 
                          : 'bg-[#4e3f28] text-[#f2ebd4] border-[#4e3f28] hover:bg-[#3d311e]'
                      }`}
                    >
                      {isNarrating ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Muter</span>
                        </>
                      ) : (
                        <>
                          <Music className="w-3.5 h-3.5" />
                          <span>Déclencher</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Narrator audio waves animated */}
                  {isNarrating && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 h-4 text-[#4e3f28]/60">
                      <div className="w-[3px] bg-current h-3 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-[3px] bg-current h-4 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                      <div className="w-[3px] bg-current h-2 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="w-[3px] bg-current h-5 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                      <div className="w-[3px] bg-current h-3 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="text-[10px] font-cinzel tracking-wider uppercase ml-1">Narration en cours</span>
                    </div>
                  )}

                  {/* Show narration status fallback notes */}
                  {narrationError && (
                    <p className="mt-2 text-[10px] italic text-[#6d3023] leading-snug">
                      {narrationError}
                    </p>
                  )}
                </div>

                {/* INTERACTIVE CHOICES & NAVIGATION PANEL */}
                <div className="mt-8 pt-6 border-t border-[#241f15]/20">
                  
                  {currentPage.choices && currentPage.choices.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] tracking-widest font-cinzel font-bold text-[#5c4a31] uppercase block mb-1">
                        ~ Que va décider l'équipage ? ~
                      </span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentPage.choices.map((choice, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleSelectChoice(choice)}
                            className="text-left px-4 py-3 border border-[#3e3422]/40 rounded hover:border-[#3e3422] hover:bg-[#1d1911]/5 text-xs font-cinzel font-bold text-[#2d251a] transition-all flex items-start gap-2.5 group"
                          >
                            <span className="p-1 border border-[#3e3422]/30 rounded-full group-hover:bg-[#3e3422] group-hover:text-[#f2ebd4] transition-all">
                              {renderRelicIcon(choice.relicIcon, "w-3 h-3")}
                            </span>
                            <span className="flex-1 leading-snug">{choice.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* CONCLUSION / TERMINAL PAGE */
                    <div className="flex flex-col items-center gap-4 py-2">
                      <div className="flex items-center gap-2 text-[#463925]">
                        <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                        <span className="font-cinzel text-xs tracking-wider uppercase font-bold">L'Aventure s'achève ici...</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={handleRestartStory}
                          className="flex items-center gap-2 px-6 py-2 border-2 border-[#3d3320] text-[#3d3320] font-cinzel font-bold text-xs uppercase rounded hover:bg-[#3d3320]/10 transition-all active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Revivre l'aventure</span>
                        </button>
                        
                        <button 
                          onClick={() => setSelectedStory(null)}
                          className="flex items-center gap-2 px-6 py-2 bg-[#3d3320] text-[#f2ebd4] font-cinzel font-bold text-xs uppercase rounded hover:bg-[#2d2517] transition-all active:scale-95"
                        >
                          <span>Autre Histoire</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>

            {/* LOWER BOOK PANEL FOR AUDIO CONTROLS */}
            {currentPage.choices && currentPage.choices.length > 0 && (
              <div className="mt-4 flex items-center justify-between w-full max-w-sm px-4">
                <button 
                  onClick={handleRestartStory}
                  disabled={currentPageNum === 1}
                  className="flex items-center gap-1.5 text-xs tracking-wider font-cinzel uppercase text-gray-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Repartir à zéro</span>
                </button>

                <div className="w-1.5 h-1.5 bg-[#c4b182]/50 rounded-full" />

                <button 
                  onClick={() => setSelectedStory(null)}
                  className="flex items-center gap-1.5 text-xs tracking-wider font-cinzel uppercase text-gray-500 hover:text-white transition-colors"
                >
                  <span>Changer de Récit</span>
                </button>
              </div>
            )}

          </div>
        )}

      </main>

      {/* PERSISTENT FOOTER CREDIT */}
      <footer className="w-full text-center py-6 border-t border-[#2c271b]/20 z-10 bg-[#050608]/80 text-[10px] font-mono uppercase tracking-[0.25em] text-gray-500">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <span>Pavillon Noir Flottant</span>
          <span className="hidden sm:inline text-gray-700">|</span>
          <span>© 2026 Récits de la flibuste</span>
          <span className="hidden sm:inline text-gray-700">|</span>
          <button 
            onClick={handleFullReset}
            className="hover:text-white transition-colors uppercase font-bold text-[#c4b182]"
          >
            Réinitialiser le Coffre
          </button>
        </div>
      </footer>

    </div>
  );
}
