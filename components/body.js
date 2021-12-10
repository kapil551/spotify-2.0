// import useState, useEffect
import { useState, useEffect } from "react";
// import the search component
import Searchbar from "./searchbar";
// import the Poster component
import Poster from "./poster";

// import useSession() hook
import { useSession } from "next-auth/react";

// import spotify API
import spotifyApi from "../lib/spotify";
// import the track component
import Track from "./track";

function Body() {

    // useState hook
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]); // searchResults will be an array of search results
    const [newReleases, setNewReleases] = useState([]); // newReleases will be an array of new releases

    // useSession
    const { data: session, status } = useSession();
    console.log(session, status);

    // get the accessToken from the session object using destructuring
    const { accessToken } = session;
    console.log("accessToken", accessToken);

    // useEffect() hook -- > checking access token
    useEffect(

        () => {
            console.log("checking access token");
            // "SIDE EFFECT WORK"

            if(!accessToken) {
                return;
            }
            else {
                spotifyApi.setAccessToken(accessToken);
            }

        }, [accessToken]
    );

    // Searching... based on search input in the searchbar
    useEffect(

        () => {

            // if the user is not searching then searchResults is empty
            if(!search) {
                return setSearchResults([]);
            }
            if(!accessToken) {
                return;
            }

            let cancelSearch = false;

            spotifyApi.searchTracks(search).then((tracksFetchedFromAPI) => {

                // console.log(tracksFetchedFromAPI);

                // update the searchResults state variable
                setSearchResults(
                    tracksFetchedFromAPI.body.tracks.items.map((track) => {
                        return {

                            id: track.id,
                            artist: track.artists[0].name,
                            title: track.name,
                            uri: track.uri,
                            albumUrl: track.album.images[0].url,
                            popularity: track.popularity,

                        }
                    })
                )
                

            }).catch((err) => {
                console.log(err);
            });

            return () => {
                cancelSearch = true;
            }
        
        }, [search, accessToken] // --> recall this useState whenever only the values of "search" and "accessToken" updates
    );

    // new realeases --> get the new relased songs from spotify API
    useEffect(
        
        () => {

            if(!accessToken) {
                return;
            }

            spotifyApi.getNewReleases().then((newReleasedTracksDataFromAPI) => {

                // console.log(newReleasedTracksDataFromAPI);

                // update the newReleases state variable
                setNewReleases(
                    newReleasedTracksDataFromAPI.body.albums.items.map((track) => {
                        return {
                            id: track.id,
                            artist: track.artists[0].name,
                            title: track.name,
                            uri: track.uri,
                            albumUrl: track.images[0].url,
                        }
                    })
                )

            }).catch((err) =>{
                console.log(err);
            });

        
        }, [accessToken] // --> recall this useState whenever only the value of "accessToken" updates
    );

    console.log("newReleases", newReleases);
    console.log("search:", search);
    console.log("searchResults", searchResults);

    return (

        // default styling in tailwindcss is always mobile responsive first, and then breakpoints are added to make it 
        // responsive for bigger screens.
        // https://tailwindcss.com/docs/flex-grow
        // https://tailwindcss.com/docs/breakpoints
        <section className="border-2 border-red-500 bg-black ml-24 py-4 space-y-8 flex-grow md:max-w-6xl md:mr-2.5">
            
            {/* Searchbar component */}
            {/* passing information using props */}
            <Searchbar search={search} setSearch={setSearch} />

            {/* poster component */}
            {/* 
                1. Making a grid using tailwind css:

                    - grid grid-cols-2 gap-x-4 gap-y-8


                2. I also want to provide a scrollable functionality to the grid:

                    - overflow-y-scroll scrollbar-hide

                3. Adding breakpoints to make the grid responsive:

                    - lg:grid-cols-3 xl:grid-cols-4

            */}

            <div className="border-2 border-green-500 h-96 p-4 grid grid-cols-2 gap-x-4 gap-y-8 overflow-y-scroll scrollbar-hide lg:grid-cols-3 xl:grid-cols-4">

                {/* Traverse on the searchResults and show the search results to the user*/}
                {/* If the searchResults is empty then by default show newReleases */}
                {
                    searchResults.length === 0 
                      
                    ? newReleases.map((track) => {

                        return (

                            <Poster 
                                key={track.id}
                                track={track}
                            />
                        )
                    })

                    : searchResults.map((track) => {
                        return (

                            <Poster 
                                key={track.id}
                                track={track}
                            />
                        )
                    })

                }

            </div>

            {/* Genres and Tracks container */}
            <div className="border-2 border-pink-600">

                {/* Genres Container */}
                <div className="border-2 border-purple-500">

                    <h2 className="border-2 border-blue-500 text-white">Genres</h2>

                    <div className="border-2 border-white text-white">

                        {/* custom class named "genre" */}
                        <div className="border-2 border-yellow-400 genre">Classic</div>
                        <div className="border-2 border-yellow-400 genre">House</div>
                        <div className="border-2 border-yellow-400 genre">Minimal</div>
                        <div className="border-2 border-yellow-400 genre">Hip-hop</div>
                        <div className="border-2 border-yellow-400 genre">Electronic</div>
                        <div className="border-2 border-yellow-400 genre">Chillout</div>
                        <div className="border-2 border-yellow-400 genre">Blues</div>
                        <div className="border-2 border-yellow-400 genre">Country</div>
                        <div className="border-2 border-yellow-400 genre">Techno</div>
                    </div>

                    <button className="border-2 border-purple-500 text-white"> All Genres </button>

                </div>

                {/* Tracks */}
                <div>
                    {
                        searchResults.length === 0

                        ? newReleases.map((track) => {

                            return (
                                <Track 
                                    key={track.id}
                                    track={track}
                                />
                            )
                        })

                        : searchResults.map((track) => {

                            return (
                                <Track
                                    key={track.id}
                                    track={track} 
                                />
                            )
                        })
                    }
                </div>

            </div>

        </section>
    )
}

export default Body;
