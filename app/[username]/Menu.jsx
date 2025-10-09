import React from 'react'

export const Menu = ({ resetCamera }) => {


//const Menu = () => {

  const showProfile = ()=>{
    // show profile menu
    // const if camera is not centered then show reset camera button
    
    // and if it is centered then make menu overlay come in

//Should be overlay menu from the top? :D


  }




  return (
      <div className="flex fixed top-1/2 right-4 flex-col gap-4 z-50">

        <div onClick={resetCamera } className="cursor-pointer hover:bg-gray-700 transition ">

          <img className='h-[25px] w-[25px] rounded-full border border-red-500 border-[2px]' src="./assets/images/profile_image.jpeg" alt="username" />
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-orbit-icon lucide-orbit"
          >
            <path d="M20.341 6.484A10 10 0 0 1 10.266 21.85" />
            <path d="M3.659 17.516A10 10 0 0 1 13.74 2.152" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="19" cy="5" r="2" />
            <circle cx="5" cy="19" r="2" />
          </svg> */}
        </div>

        {/* <div
          onClick={() => {
            setDrag(!drag);
          }}
          className="move"
        >
          {drag ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-hand-icon lucide-hand"
            >
              <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
              <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-hand-grab-icon lucide-hand-grab"
            >
              <path d="M18 11.5V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4" />
              <path d="M14 10V8a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 9.9V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5" />
              <path d="M6 14a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
              <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0" />
            </svg>
          )}
        </div> */}

       
      </div>
  )
}

export default Menu