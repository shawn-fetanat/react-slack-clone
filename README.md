# My React-Slack-Clone

I know convention is to have a separate folder for components, actions, reducers, etc
but I put everything in the src folder for those who want to look at my code
and learn from it. It just makes it easier for them to see everything in src
rather have to click back forth through folders.

# List of Features
List of features:
- Authentication using google authentatication and
- Uses context api and useReducer hook to create a data layer where user info is shared between all components
- Once user is logged in, it maps all the correct info to the view layer for the user to see (ex. if I'm logged in I correctly see my name and my avatar picture
- You can create channels and once you create a channel it automatically appeears in the sidebar 
- You can navigate between the channels (using react-router-dom) by clicking the desired channel in the side bar
- You you can send and receive messages in those channels and they will appear in the correct coressponding channel with the correct name, user image, and timestamp for each message
- All the data (channels, user info, messages, userImage/avatar, timestamp,  etc) is being read and written to and from a firebase database collection using an instance of the firebase database collection reference (w/ that instance i made async calls (HTTP requests) to my firebase database and I receive a promise back which i use to then either map to my view layer or store it in globally piece of state like i did with user (see below for explanation on that)

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

# Other Concepts

#### The “non-existing property” problem

Maybe you've stumbled upon this problem maybe you haven't, but it’s quite common.
As an example, let’s say we have user objects that hold the information about our users.
Most of our users have addresses in user.address property, with the street user.address.street, but some did not provide them.
In such case, when we attempt to get `user.address.street`, and the user happens to be without an address, we get an error:

```
let user = {}; // a user without "address" property

alert(user.address.street); // Error!
```

That’s the expected result. JavaScript works like this. As `user.address` is `undefined`, an attempt to get `user.address.street` fails with an error. How can we do this? The obvious solution would be to check the value using `if` or the conditional operator `?`, before accessing its property, like this:

```
let user = {};

alert(user.address ? user.address.street : undefined);
```
It works, there’s no error… But it’s quite inelegant. As you can see, the "user.address" appears twice in the code. For more deeply nested properties, that becomes a problem as more repetitions are required.

E.g. let’s try getting `user.address.street.name`.

We need to check both `user.address` and `user.address.street`

```
let user = {}; // user has no address

alert(user.address ? user.address.street ? user.address.street.name : null : null);
```

That’s just awful, one may even have problems understanding such code.
Don’t even care to, as there’s a better way to write it, using the `&&` operator:

```
let user = {}; // user has no address

alert( user.address && user.address.street && user.address.street.name ); // undefined (no error)
```

AND’ing the whole path to the property ensures that all components exist (if not, the evaluation stops), but also isn’t ideal.

As you can see, property names are still duplicated in the code. E.g. in the code above, `user.address` appears three times.

That’s why the optional chaining `?.` was added to the language. To solve this problem once and for all!

### Optional Chaining
The optional chaining `?.` stops the evaluation if the value before `?.` is` undefined` or `null` and returns `undefined`.
Here’s the safe way to access `user.address.street` using `?.`:

```
let user = {}; // user has no address

alert( user?.address?.street ); // undefined (no error)
```

The code is short and clean, there’s no duplication at all.

Reading the address with `user?.address` works even if `user` object doesn’t exist:

```
let user = null;

alert( user?.address ); // undefined
alert( user?.address.street ); // undefined
```

Please note: the `?.` syntax makes optional the value before it, but not any further.

E.g. in `user?.address.street.name` the `?.` allows `user` to safely be `null/undefined` (and returns `undefined` in that case), but that’s only for `user`. Further properties are accessed in a regular way. If we want some of them to be optional, then we’ll need to replace more `.` with `?.`.
