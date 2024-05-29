import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Store } from "react-notifications-component";
import pewpew from "../asserts/image8.gif";
import pewpewship from "../asserts/pewpewship.png";
import {
  getCollectionInfo,
  mintFuel,
  updateQuanities,
} from "../controllers/program";
import discord from "../asserts/discord.png";
import twitter from "../asserts/twitter.png";
import missionmap from "../asserts/missionmap.jpg";

export default function Page() {
  const wallet = useWallet();
  const connection = useConnection().connection;
  const [mintValue, setMintValue] = useState(1);
  const [claimed, setClaimed] = useState(false);
  const [info_text, setInfoText] = useState(
    "Searching your inventory for fuel canisters… please wait"
  );

  const getOwnedNFT = async () => {
    setInfoText("");
  };

  useEffect(() => {
    if (!wallet.connected) {
      setInfoText("Please connect your wallet.");
    } else {
      setInfoText("Searching your inventory for fuel canisters… please wait");
      getOwnedNFT();
    }
  }, [wallet.connected]);

  return (
    <div className="container mx-auto my-4">
      <img src={pewpew} className="w-100" />
      <div className="row my-3 mx-auto">
        <div className="mx-auto text-center">
          <div
            className="mint-section p-3 mx-auto"
            style={{ minWidth: "360px", maxWidth: "360px" }}
          >
            <img src={pewpewship} width={"100px"} className="m-2" />
            <h3 style={{ color: "white" }}>Claim Pew Pew Ship</h3>
            <div className="available-fuels text-white p-3 m-2">
              {claimed ? (
                <>
                  <p className="fw-bold my-2" style={{ color: "greenyellow" }}>
                    Ships Claimed
                  </p>
                  <p>Your Pew Pew Ship will appear in your wallet shortly.</p>
                </>
              ) : (
                <>
                  <p className="fw-bold my-2" style={{ color: "greenyellow" }}>
                    Available Fuel
                  </p>
                </>
              )}
            </div>
            <div className="available-fuels text-white p-3 m-2">
              {claimed ? (
                <>
                  <p>// PRIORITY MESSAGE</p>
                  <p> Welcome to the Fleet, Captain. </p>
                  <p>
                    {" "}
                    Stay connected in Discord to receive more information about
                    your future missions.{" "}
                  </p>
                  <p> See you in battle! </p>
                </>
              ) : (
                <>
                  <p className="fw-bold my-2" style={{ color: "greenyellow" }}>
                    Claim Ships
                  </p>
                  <div className="flex">
                    <button
                      className="claim-button m-2 p-2 fw-bold"
                      onClick={() => {
                        if (mintValue - 1 > 0) setMintValue(mintValue - 1);
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="claim-number m-2 p-2 fw-bold text-center"
                      min={0}
                      max={1}
                      value={mintValue}
                    ></input>
                    <button
                      className="claim-button m-2 p-2 fw-bold"
                      onClick={() => {
                        if (mintValue + 1 <= 1)
                          setMintValue(mintValue + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                  <p>
                    {info_text === ""
                      ? `You can claim up to ${1} ships`
                      : "[...Scanning]"}
                  </p>
                </>
              )}
            </div>
            <div className="flex justify-content-around w-100">
              {claimed ? (
                <button
                  type="button"
                  className="claim-main-button m-1"
                  onClick={() => setClaimed(false)}
                >
                  Ok
                </button>
              ) : (
                <>
                  <button type="button" className="claim-cancel-button m-1">
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="claim-main-button m-1"
                    // disabled={!can_mint}
                    onClick={async () => {
                      try {
                        await mintFuel(connection, wallet, 10);
                        Store.addNotification({
                          title: "Success to mint",
                          message: `${mintValue} Ships are minted.`,
                          type: "success",
                          insert: "top",
                          container: "top-right",
                          animationIn: ["animate__animated", "animate__fadeIn"],
                          animationOut: [
                            "animate__animated",
                            "animate__fadeOut",
                          ],
                          dismiss: {
                            duration: 3000,
                            onScreen: true,
                          },
                        });
                        setClaimed(true);
                        getOwnedNFT();
                      } catch (e) {
                        console.log(e);
                        Store.addNotification({
                          title: "Error",
                          message: "Something went wrong",
                          type: "danger",
                          insert: "top",
                          container: "top-right",
                          animationIn: ["animate__animated", "animate__fadeIn"],
                          animationOut: [
                            "animate__animated",
                            "animate__fadeOut",
                          ],
                          dismiss: {
                            duration: 3000,
                            onScreen: true,
                          },
                        });
                      }
                    }}
                  >
                    Claim
                  </button>
                </>
              )}
            </div>
            <button onClick={() => getCollectionInfo(connection, wallet)}>
              Update Time
            </button>
          </div>
          <p
            style={{
              color: "red",
            }}
            className="justify-item-center mt-4"
          >
            {info_text}
          </p>
        </div>
      </div>
      <hr />

      <div>
        <br></br>
        <h1 id="what" className="mt-4">
          What is Pew Pew?
        </h1>
        <div className="ml-custom">
          <br></br>
          <p>
            Pew Pew is a journey across the galaxy, from meme to reality! Our
            digital collectibles will offer the keys to the Pew Pew universe.
          </p>
          <p>
            The ultimate mission for our band of space buccaneers is to reach
            the Interdimensional Gate and leave the 8-bit universe to explore
            unknown and unreal worlds. We have much to discover and are ready
            for the challenges ahead.
          </p>
        </div>
        <br></br>

        <h1 id="mission" className="mt-4">
          Mission Map
        </h1>
        <br></br>
        <img src={missionmap} className="w-100" />
        <br />
        <br></br>

        <div className="ml-custom mt-4">
          <p>There are three ways to reach the Interdimensional Gate.</p>
          <div className="ml-custom">
            <p>
              1. In a Pew Pew Ship: Explore the remnants of destroyed resupply
              space stations in the hunt for fuel canisters. Collect enough fuel
              to power your rickety pirate ship to the Pew Pew Shipyards. At the
              Shipyards, you will receive a Pew Pew Ship.
            </p>
            <p>
              2. Via Warp Drive: Gain access to a warp drive through a DAO
              platform.
            </p>
            <p>
              3. Aboard our Pew Pew Carrier Transport: Complete missions until
              you earn passage for an express trip to the gate.
            </p>
          </div>
          <p>
            Once you travel beyond the Pew Pew dimension, you’ll gain access to
            our first “real” still-very-secret spaceship NFT collection, among
            other things.
          </p>
        </div>

        <br></br>
        <h1 id="faqs" className="mt-4">
          FAQs
        </h1>
        <div className="ml-custom">
          <br />
          <h6 className="mb-2">WHY ARE YOU DOING THIS?</h6>
          <br />
          <div className="ml-custom">
            <p>
              Our team is here because we love to pew pew! More importantly, we
              love to develop games that go pew pew!
            </p>
            <p>
              For the last several months, we’ve been working on a AAA space
              warfare game (Therefore, “pew pew.” Get it?). The game will
              integrate blockchain technology and will appeal to traditional
              gamers, Web3 players, and collectors.
            </p>
            <p>
              The game is fully funded and will be released in 2023. We’re not
              pew-pewing around!
            </p>
            <p>
              We believe that the successful integration of Web3 into AAA games
              can only happen if gameplay comes first and players get value.
              That’s why we’re excited to welcome all kinds of gamers to Web3 by
              embracing fun and digital ownership and using our space laser (pew
              pew!) to vanquish speculators and cash grabs.
            </p>
          </div>
          <br />
          <h6 className="mb-2">WHO ARE YOU PEOPLE?</h6>
          <br />
          <div className="ml-custom">
            <p>
              We are a AAA video game developer and publisher based in the US,
              with over a decade of experience developing and operating online
              games. We’ve developed and published games on PC, PlayStation, and
              Xbox.
            </p>
          </div>
          <br />
          <h6 className="mb-2">WHAT ARE THE UPCOMING MINTS?</h6>
          <br />
          <div className="ml-custom">
            <p>
              We’re planning three mints, with more to follow. NFTs will be
              minted in the Solana blockchain:
            </p>
            <div className="ml-custom">
              <p className="fw-bold"> Mint # 1 - Pew Pew Fuel Canisters </p>
              <p>
                The Pew Pew Fuel Canisters will be exchanged for Pew Pew Ships,
                to be minted as part of our Mint # 2.
              </p>
              <div className="ml-custom">
                <p>
                  <span className="fw-bold">SUPPLY: </span>8,500 (8,000
                  quarter-full, 500 full)
                </p>
                <p>
                  <span className="fw-bold">PRICE: </span>Fuel Canisters NFTs
                  will be minted for 0.1 SOL (plus anti-botting fee and gas).{" "}
                </p>
                <p>
                  <span className="fw-bold">MINT DATE: </span> Limited numbers
                  of canisters will be distributed daily starting on{" "}
                  <span className="fw-bold">January 16, 2023</span> until we run
                  out.
                </p>
              </div>
              <br></br>

              <p className="fw-bold">Mint # 2 - Pew Pew Ships</p>
              <p>
                Holders of Pew Pew Ships will receive allowlist spots to our
                first main NFT collection (Mint # 3). Holders of fuel canisters
                will burn them to receive Pew Pew Ships.
              </p>
              <div className="ml-custom">
                <p>
                  <span className="fw-bold">SUPPLY: </span>2,500 unique ships
                  with different levels of rarity.
                </p>
                <p>
                  <span className="fw-bold">PRICE: </span> One (1) full Pew Pew
                  Fuel Canister OR four (4) Quartet-Full Canisters (plus
                  anti-botting fee and gas).
                </p>
                <p>
                  <span className="fw-bold">MINT DATE: </span>
                  <span className="fw-bold">February 22, 2023</span>
                </p>
              </div>
              <br></br>
              <p className="fw-bold">
                Mint # 3 - Secret Spaceship Collection - details to be announced
                soon.
              </p>
              <p>
                Here’s where things get interesting. We can’t tell you much
                about this collection except that the starships are colossal and
                beautiful. Holders of these NFTs will receive incredible access
                to many exciting things that will go pew pew in spectacular
                ways!
              </p>
              <div className="ml-custom">
                <p>
                  <span className="fw-bold">SUPPLY: </span> 7,500 (many ship
                  types with various levels of rarity)
                </p>
                <p>
                  <span className="fw-bold">PRICE: </span> TBD (SOL)
                </p>
                <p>
                  <span className="fw-bold">MINT DATE: </span> Early 2023 (exact
                  date to be announced soon)
                </p>
              </div>
            </div>
          </div>
          <br />
          <h6 className="mb-2">WHEN WILL YOU TELL US MORE ABOUT THE GAME?</h6>
          <br />
          <div className="ml-custom mt-4">
            <p>
              There have been some leaks about the game. Join us on{" "}
              <a href="https://discord.gg/PewPewGalaxy">Discord</a> or{" "}
              <a href="https://twitter.com/PewPewGalaxy">Twitter</a> to be in
              the know!
            </p>
          </div>
          <br />
          <h6 className="mb-2">WHAT IS WEB3 GAMING?</h6>
          <br />
          <div className="ml-custom">
            <p>
              We believe that Web3 gaming, at its core, is a decentralized way
              of providing gamers with true ownership of their digital assets.
              Our goal is to take a gameplay-centric approach and develop a Web3
              gaming experience that traditional gamers will be excited to
              embrace.
            </p>
          </div>
          <br />
          <h6 className="mb-2">
            <br />I HAVE QUESTIONS. HOW DO I GET IN TOUCH WITH YOU?
          </h6>
          <div className="ml-custom">
            <p>
              We’re hanging out on Discord and Twitter. Join us there, and
              remember the magic word!
            </p>
            <p>
              Discord:{" "}
              <a href="https://discord.gg/PewPewGalaxy">
                https://discord.gg/PewPewGalaxy
              </a>
            </p>
            <p>
              Twitter:{" "}
              <a href="https://twitter.com/PewPewGalaxy">
                https://twitter.com/PewPewGalaxy
              </a>
            </p>
          </div>
        </div>
        <br></br>
        <br></br>

        <div className="row mx-auto justify-content-center">
          <a href="https://twitter.com/PewPewGalaxy" className="mr-4">
            <img src={twitter} height="48px" />
          </a>
          <a href="https://discord.gg/PewPewGalaxy">
            <img src={discord} height="48px" />
          </a>
        </div>
        <br></br>
        <br></br>
      </div>
    </div>
  );
}
