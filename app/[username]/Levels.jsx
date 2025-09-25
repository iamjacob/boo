import React from 'react'
import ConfettiDopamine from "./components/ConfettiDopamine";
import { useLevelStore } from '../../stores/useLevelStore';

const Levels = () => {


const level = useLevelStore((s) => s.level);

  return (
    <>
    
      {/*
       *
       *
       *           LEVEL STIGNING!
       *
       *
       * */}

      {/* Level stigning fra useStore */}
      {/* Hvis i 7 sekunder medmindre lukkes */}
      {/* 
{
"newLevel":true,
"level":useLevelStore().get new level live!,
"unlocks":[],
"text":setting[level].leveltekst,
"status":sidenSidst(this.user from last level to this level (read x, all recordings since lastLevel datetime)),
"":,
}
 */}


       {/* <ConfettiDopamine
        // images={[
        //   "/favicon/apple-touch-icon.png",
        // ]}
      />  */}
      
      {(level > 1) && ( 
        <>
        {/* this is level {level}! */}
        {/* should only show for a few seconds when level goes up! */}
        
        {/* + sent object into it from here.. ;) */}
          <ConfettiDopamine direction="up" images={["/favicon/apple-touch-icon.png"]} />
        </>
        )
      }

    </>

  )
}

export default Levels