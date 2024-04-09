```jsx
import React, { useState } from 'react';

const sharedClasses = {
    button: "text-white focus:outline-none",
    input: "bg-zinc-800 text-white px-3 py-2 rounded-lg focus:outline-none",
    navButton: "bg-blue-500 text-white px-4 py-2 rounded-lg mr-2",
    signInButton: "bg-green-500 text-white px-4 py-2 rounded-lg",
    closeButton: "absolute top-4 right-4 text-white focus:outline-none",
    menuItem: "py-2",
    thumbnail: "w-full h-full object-cover rounded-lg cursor-pointer",
};

const Navbar = () => {
    const [menuVisible, setMenuVisible] = useState(false);

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    return (
        <div className="bg-zinc-900 text-white">
            <nav className="flex items-center justify-between p-4">
                <div className="flex items-center">
                    <button id="menuBtn" className={sharedClasses.button} onClick={toggleMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                        </svg>
                    </button>
                    <div className="ml-2">
                        <img src="https://placehold.co/50x50" alt="Site Logo" className="h-8 w-8" />
                        <span className="ml-2 text-lg font-bold">Website Name</span>
                    </div>
                </div>
                <div>
                    <input type="text" placeholder="Search..." className={sharedClasses.input} />
                </div>
                <div>
                    <button className={sharedClasses.navButton}>Login</button>
                    <button className={sharedClasses.signInButton}>Sign In</button>
                </div>
            </nav>
            {menuVisible && (
                <div id="menu" className="absolute top-0 left-0 w-full h-full bg-zinc-900 text-white z-10">
                    <button id="closeBtn" className={sharedClasses.closeButton} onClick={toggleMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    <ul className="flex flex-col items-center justify-center h-full">
                        <li className={sharedClasses.menuItem}>Home</li>
                        <li className={sharedClasses.menuItem}>Trending</li>
                        <li className={sharedClasses.menuItem}>Random</li>
                        <li className={sharedClasses.menuItem}>Browse</li>
                        <li className={sharedClasses.menuItem}>Contact</li>
                        <li className={sharedClasses.menuItem}>Terms of Use</li>
                        <li className={sharedClasses.menuItem}>EULA</li>
                        <li className={sharedClasses.menuItem}>Privacy</li>
                    </ul>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                <div className="relative h-64 md:h-96 lg:h-80">
                    <img src="https://placehold.co/800x450" alt="Video Thumbnail" className={sharedClasses.thumbnail} onClick={() => window.location.href='video1.html'} />
                </div>
                <div className="relative h-64 md:h-96 lg:h-80">
                    <img src="https://placehold.co/800x450" alt="Video Thumbnail" className={sharedClasses.thumbnail} onClick={() => window.location.href='video2.html'} />
                </div>
                <div className="relative h-64 md:h-96 lg:h-80">
                    <img src="https://placehold.co/800x450" alt="Video Thumbnail" className={sharedClasses.thumbnail} onClick={() => window.location.href='video3.html'} />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
```