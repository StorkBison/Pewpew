import { WalletConnect } from "../wallet";
import WhatImage from "../asserts/what-pew-pew.png";
import twitter from "../asserts/twitter.png";
import mission from "../asserts/mission.png";
import discord from "../asserts/discord.png";
import faqs from "../asserts/faqs.png";
const Header = () => {
  return (
    <div className="menu-back cbp-af-header">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <nav className="navbar navbar-expand-xl navbar-light mx-lg-0">
              <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon">
                  <span className="menu-icon__line menu-icon__line-left"></span>
                  <span className="menu-icon__line"></span>
                  <span className="menu-icon__line menu-icon__line-right"></span>
                </span>
              </button>

              <div
                className="collapse navbar-collapse"
                id="navbarSupportedContent"
              >
                <ul className="navbar-nav ml-auto justify-content-around w-100 text-center align-center">
                  <li className="nav-item mt-4">
                    <a href="#what">
                      <img src={WhatImage} height="60px" />
                    </a>
                  </li>
                  <li className="nav-item mt-4">
                    <a href="#mission">
                      <img src={mission} height="60px" />
                    </a>
                  </li>
                  <li className="nav-item mt-4">
                    <a href="#faqs">
                      <img src={faqs} height="60px" />
                    </a>
                  </li>
                  <li className="nav-item mt-4">
                    <a href="https://twitter.com/PewPewGalaxy">
                      <img src={twitter} height="60px" />
                    </a>
                  </li>
                  <li className="nav-item mt-4">
                    <a href="https://discord.gg/PewPewGalaxy ">
                      <img src={discord} height="60px" />
                    </a>
                  </li>
                  <div className="mr-6 wallet-button-nav mt-4">
                    <WalletConnect />
                  </div>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
