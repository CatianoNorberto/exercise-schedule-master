import { createContext, ReactNode, useEffect, useState} from 'react';
import Cookies from "js-cookie";
import challenges from "../../challenges.json";
import { LeveUpModal } from '../components/LeveUpModal';

interface Challenge{
  type: "body" | "eye";
  description: string;
  amount: number;
}

interface ChallengeContxtData {
  level: number; 
  currentExperience: number; 
  challengeCompleted: number;
  experienceToNextLevel: number;
  activeChallenge: Challenge;
  levelUp: () => void;
  startNewChallenge: () => void;
  resetChallenge: () => void;
  completeChallenge: () => void;
  closeLevelUpModal: () => void;
}

interface ChallengeProviderProps {
  children: ReactNode;
  level: number;
  currentExperience: number;
  challengeCompleted: number;
}


export const ChallengeContext = createContext({} as ChallengeContxtData);

export function ChallengeProvider({
  children,
  ...rest
}: ChallengeProviderProps) {
  const [level, setLevel] = useState(rest.level ?? 1);
  const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0);
  const [challengeCompleted, setChallengeCompleted] = useState(rest.challengeCompleted ?? 0);

  const [activeChallenge, setActiveChallenge] = useState(null);
  const [isLevelUpModalOpen, setisLevelUpModalOpen] = useState(false)

  const experienceToNextLevel = Math.pow((level + 1) * 4, 2);

  useEffect(() => {
    Notification.requestPermission();
  }, [])

  useEffect(() => {
   Cookies.set("level", String(level));
   Cookies.set("currentExperience", String(currentExperience));
   Cookies.set("challengeCompleted", String(challengeCompleted));
  }, [level, currentExperience, challengeCompleted]);

  function closeLevelUpModal(){
    setisLevelUpModalOpen(false);
  }

  function levelUp(){
    setLevel(level + 1);
    setisLevelUpModalOpen(true)
  }

  function startNewChallenge(){
    const randomChallengeIndex = Math.floor(Math.random() * challenges.length);
    const challenge = challenges[randomChallengeIndex];

    setActiveChallenge(challenge);

    new Audio("/notification.mp3").play();

    if(Notification.permission === "granted") {
      new Notification(" Novo Desafio ???? ", {
        body: `Valendo ${challenge.amount}xp!`
      })
    }
  }

  function resetChallenge(){
    setActiveChallenge(null);
  }

  function completeChallenge(){
    if(!activeChallenge){
      return;
    }

    const { amount } = activeChallenge;

    let finalExperience = currentExperience + amount;

    if (finalExperience >= experienceToNextLevel){
      finalExperience = finalExperience - experienceToNextLevel
      levelUp();
    }

    setCurrentExperience(finalExperience);
    setActiveChallenge(null);
    setChallengeCompleted(challengeCompleted + 1);
  }

  return (
    <ChallengeContext.Provider 
    value=
    {{ 
      level, 
      currentExperience, 
      challengeCompleted,
      experienceToNextLevel,
      activeChallenge, 
      levelUp, 
      startNewChallenge,
      resetChallenge,
      completeChallenge,
      closeLevelUpModal,
    }}>

      {children}

      { isLevelUpModalOpen && <LeveUpModal/> }
    </ChallengeContext.Provider>
  )
}