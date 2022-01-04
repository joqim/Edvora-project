import { useState } from "react"
import axios from "axios"

export default function PokemonSearch(){

  const [pokemonName,setPokemonName] = useState('')
  const savePokemon = ()=> {

    if(pokemonName==''){
      return
    }else{
       // make api call to our backend. we'll leave thisfor later
        axios.post('http://localhost:8000/save_pokemon',{
          pokemon_name: pokemonName
        })
        .then(function(response){
          console.log(response,'saved pokemon')
        })
        .catch(function(error){
          console.log(error,'error');
        });
    }
  }

    return(
        <>
          <div style ={{marginTop:20,minHeight:700}}>
            PokemonSearch
            <form>
              <label style={{marginRight: 10 }}>Name</label>
              <input type='text' onChange={(e)=>setPokemonName(e.target.value)}/>
              <button type='button' onClick={savePokemon}>Save</button>
            </form>
          </div>
        </>
    )
}