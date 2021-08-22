# My React-Slack-Clone

I know convention is to have a separate folder for components, actions, reducers, etc
but I put everything in the src folder for those who want to look at my code
and learn from it. It just makes it easier for them to see everything in src
rather have to click back forth through folders.


# Explanation on how I set the user using Context API and the useReducer hook
So for this project I used the legit google authentication so it only makes sense that I had to figure out to manage setting the user because each page (component) I had would need to know if an authenticated user is logged in or not otherwise it should show the login screen. I could have prop drilled my components aka pass down props one child at time to the appropriate component in the component tree but that would take forever. So the smarter solution was to createContext and call it stateContext then I passed my useReducer hook to value of my ContextProvider (I named mine StateProvider). My useReducer hook takes in a reducer and the initialState as it's arguments and returns an array that holds the current state value and a dispatch function, to which you can pass an action and later invoke. To be clear an action is an object that tells the reducer how to change the state. An aciton MUST contain a type property, and it can contain an OPTIONAL payload property. So The reducer function itself accepts two parameters: the current state, and the action. The reducer then returns one value: the new state. The reducer is a pure function meaning as long as you give it the same input you can expect the output will stay the same. You can essentially think of it as I/O. In code-speak reducer(state, action) => newState. Take a wild guess why it's called a reducer. Think about it. It took it two arguments but returned one value (also see javascript reduce() function). 

So going back to my ContextProvider (I called my ContextProvider StateProvider) because when I created context with createContext I called it StateContext. So my StateProvider accepts three props, children, reducer, and initialState and it returns a StateContext.Provider. Think of the StateContext.Provider as bus holds both the current state and the trigger function (dispatch) for a state manipulation (done by reducer). It's easy to lose track so I'll remind anyone who's reading that when dispatch triggers the reducer and the reducer executes the action (based on the action type) the result is a new state. Think of the StateProvider as the one that Provides the Context to whoever it wraps. Note my context is state. Hence the reason I pass StateContext to useContext and set it equal to a const called useStateValue. 

###### StateProvider.js (This is where declaraed my context and defined it)
```
import React, { createContext, useContext, useReducer } from "react";

export const StateContext = createContext();

export const StateProvider = ({ reducer, initialState, children }) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
);

export const useStateValue = () => useContext(StateContext);
```

Then I in my index.js I did...

###### index.js (This is where I actually deployed my Context Provider and put it to use)
```
import App from "./App";
import { StateProvider } from "./StateProvider";
import reducer, { initialState } from "./reducer";

ReactDOM.render(
  <React.StrictMode>
    <StateProvider initialState={initialState} reducer={reducer}>
      <App />
    </StateProvider>
  </React.StrictMode>,
  document.getElementById("root")
 ```
 
Notice in my StateProvider.js I wrapped {children} with my ContextProvider then when I used ContextProvider in my index.js I wrapped <App/> where {children} was in my ContextProvider defintion. What that does is it gives all of my App.js's children access to my Context via my ContextProvider. Normally if I had just used Context (without useReducer) if I wanted access to the information the Provider has I would have had to access it inside (nested in/wrapped in) a Context.Consumer. But because I used this little trick here there's no need for a Context.Consumer because all of App's chilren already have access to the context with a simple import and because value of the provider recieved useReducer the context that i get back is state and dispatch. Let's take a look at exactly how I did that...

###### Login.js
```
import { auth, provider } from "./firebase";
import { useStateValue } from "./StateProvider";
import { actionTypes } from "./reducer";

function Login() {
  const [state, dispatch] = useStateValue();

  const signIn = (e) => {
    e.preventDefault();
    auth
      .signInWithPopup(provider)
      .then((result) => {
        console.log(result);
        dispatch({
          //dispatch SET_USER ACTION
          type: actionTypes.SET_USER,
          user: result.user, //push user into the data layer
        });
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  console.log(state);

```
If you're confused with where useStateValue() came from look back up at my StateProvider.js and look at the bottom. See how I did...

```
export const useStateValue = () => useContext(StateContext);
```

That's why all I had to do was import { useStateValue } which gave me access to dispatch. Remember dispatch MUST have an action type as you can see here it's SET_USER and here it additionally is taking a payload which it is getting as the promise returned from the successful HTTP request for user. It then delivers the payload to the reducer and inside reducer user which started out with an initialValue value for state.user of null will now have the value of the current user (upon successful HTTP request for user). Here is my reducer. Notice there is an initial/Default State that is user and I set to null. Notice how there's an ActionType called SET_USER. I like to think of the action type as key that the reducer uses to dicypher what action to take. The switch statement just a form of conditional statement in which it handles cases based on the condition. If the reducer receives an action type (by the dispatch) then handle the case otherwise just return the current state (default case). In my situation I have one case for and it's for actionType.SET_USER. So when that's the action type indicated by the dispatch then perform the action on the piece of state which in my case is user.

```
export const initialState = {
  user: null,
};

export const actionTypes = {
  SET_USER: "SET_USER",
};

const reducer = (state, action) => {

  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.user,
      };
    default:
      return state;
  }
};

export default reducer;
```

So lets pretend a person logged in and inside the reducer magic happened and the user has been set and is no longer a null value. What now? How does App.js know it should render the chatroom and not the login screen? Let's a take a look at my App.js...

###### App.js
```
~~~~~~
import { useStateValue } from "./StateProvider";

function App() {
  const [{ user }] = useStateValue();

  return (
    <div className="app">
      <Router>
        {!user ? (
          <Login />
        ) : (
          <>
            <Header />
            <div className="app__body">
              <Sidebar />
              <Switch>
                <Route path="/room/:roomId">
                  <Chat />
                </Route>
                <Route path="/">
                  <h1>Welcome</h1>
                </Route>
              </Switch>
            </div>
          </>
        )}
      </Router>
    </div>
  );
}

export default App;
```

To access user all i had to do was import my useStateValue which is just the same thing as useContext then I destructured {user} and now I have access to it. Then lastly, I used conditional render to render <Login /> if !user (which just means if user = false = null = 0) otherwise render the rest of the app (aka give user access to the rest of the app. Hope this helped anyone confused about this implementation. Pretty cool huh!!! 
