# Crpyto Wallet Project Journal:
---

This is to document the progress of the app as well as better 
understand how the app functions as a whole. This isn't my project but a tutorial I am following as a beginner. The aim is to:
- understand existing start template and project aims
- Document additional changes and the reason for them.
- Document any concepts learned along the way and the basic principles for them

Hopefully this serves as good way to see the breakdown in a project, and the thought process/learning as I go along.

---
## Existing Code analysis:

### Index.js (root):
Index.js currently register the App.js to the file. This is the root index.js unlike the other folder specific indexes that allow the relevant objects to be used. The registry is shown below:

    ```javascript
    import {AppRegistry} from 'react-native';
    import App from './App';
    import {name as appName} from './app.json';

    AppRegistry.registerComponent(appName, () => App);
    ```

This serves as the entry point to running all React Native(RN) apps. According to documentation, this is where all Approot components shoudl be registered.


### App.js (root):
The root app file, contains a `NavigationContainer` with a nested `Stack.Navigator`. Currently this shows the starting route which is the mainLayout. This currently serves as the 'homepage' screen. Will likely change.

### Other files and folders 
Found in the navigation folder, the tabs file is implementing a tabs Navigator. `Tab.Navigator` creates a simple tab bar at the bottom of the screen.The aim of this file is to server as the nav bar for the relevant screens found in the screens folder.

In the screens folder, we just have a number of screens that are made available via an index file. This allows us to use this within other files for the app. 

---

## Additions to the app:

### Bottom Tabs Navigator:

- A new folder components has been created, the file TabIcon has been exposed via the index file within the folder. The TabIcon is being used to populate the bottom navigator/nav bar at the bottom with the icons for each of the screens we will be linking to.


        options={{
                    tabBarIcon: ({ focused }) => {
                        return (
                            <TabIcon
                                focused={focused}
                                icon={icons.trade}
                                label="Trade"
                                isTrade={true}
                            />
                        )
                    }
                }}

The addition above allows to place a TabIcon object for each of the tab screens that we will route to. A TabIcon object is just:

        const TabIcon = (focused,) => {
            return (
            <View>
                <Text>Tab</Text>
            </View>
        )
    }

Currently it is just a View component with some text. We are going to edit this to change the appearance of each of the tabs. We want to pass in a few props.

So TabIcon was now changed to do two things. Firstly it takes `props`. These props, are the props used by each `tab.Screen` in tabs.js.Looking at the code block above we can remember that we created a TabIcon component inside each `tab.Screen` of the `Tab.Naviagator`. Second, we are conditionally returning component data. Using the props we pass from tabs.js, we choose to either render a `Text` component, or render an `Image` component, showing the relevant icon based on the prop arguments given. The code chane is below:

        const TabIcon = ({ focused, icon, iconStyle, label, isTrade }) => {
            if (isTrade) {
                return (

                    <View>
                        <Text style={{ color: COLORS.white }}>Trade</Text>
                    </View>
                );
            } else {
                 return (
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                        source={icon}
                        resizeMode='contain'
                        style={{
                        width: 25,
                        height: 25,
                        tintColor: focused ? COLORS.white : COLORS.secondary,
                        ...iconStyle
                        }}
                    />
                    </View>
                )
            }
        }


The final change that was made was rather than just render some text saying 'trade' we want to create what will visually be our button. Remember we are passing props and just like the other tabs, trade will also act like its own tab. We still provide the icon but we also edit the `view` component properties. This will enable us to show the visual difference between the tabs and the trade 'button'. final code addition for this section is below:

        <View
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: COLORS.black
                }}
            >
                <Image
                    source={icon}
                    resizeMode='contain'
                    style={{
                        width: 25,
                        height: 25,
                        tintColor: COLORS.white,
                        ...iconStyle
                    }}
                />
                <Text style={{ color: COLORS.white }}>Trade</Text>
            </View>

Remember that the `View` component allows us to view the elements thyat will make up our UI. The Image component is being shown with the icon being our scource. This is being passed through as a prop from our `tabs.js` file which is our root navigation.

### Trade Screen:

Aim: When we tap the trade button we want the following to happen:
- We want two buttons to slide up from the navigator.
- All other tab options should disappear.
- The trade button should change icon to show a cancelling icon.
- The screen 'behind' should be dimmed allow user focus on menu.
- This should be a consistent behaviour for all screens.

So what we intend to do is create root view to handle this.

After creating the MainLayout component, we want to wrap all required screens using this root screen. This will allow us to achieve a consistent behaviour for all screens.

We have passed in a prop to hold the children (these will be the screens we want to wrap around), we also provide a `flex` of 1. 

Main Layout has been added to the child screens that we want to wrap around. 

Trade button has modified to account for an onPress change. We go to the `tabs.js`  to modify the trade `tab.Screen` to include a `tabBarButton`. 

`tabBarButton` we pass a prop to this which is then consumed by the `TabBarCustomButton`. When the button is pressed, we then log that the trade button has been pressed. The  `TabBarCustomButton`itself returns a `TouchableOpacity` component. Because this takes the children prop,the wrapped tab screen that is passed will be dimmed when the trade button is pressed.

We plan to now track when the trade button is being clicked -> solution: react-redux.

We created a new `tabActions.js` to enable the state change of the visibility of the trade button change. We have added **actions** that redux will use to keep track of the state of the trade button. Specifically when we tap the trade button. 

In the `tabReducer.js` we create a **reducer** that takes the current state of the of the trade modal visibilty, initially false, and changes it to a new state which is true. As we will undoubtedly create more reducers in the future, we create a root reducer, that uses the `combineReducers` helper function to combine into one single, reducer that will be passed to `createStore` which we will now inject into our app.


We injected the actions and the state coming from the tabaction and tabreducer via props which can now be accessed via the anon tabs functional component.

Now we create a button press handler that will be used when the react `onPress` hook is called. redux keeps track of the state. 

Now for the other tabs, we wanted them to disappear when the trade button is pressed. What we can do is conditionally return the props for the tab Icon. To prevent the tabs from still being usable when invisible we change the listener to prevent this behaviour under specific conditions:

        listeners={{
                    tabPress: e => {
                        if(isTradeModalVisible){
                            e.preventDefault
                        }
                    }
                }}

We want to create the two trade button options. As they will be using a common button/same button, we want to make this as a component that can be reused. this is what we have done in `IconTextButton.js`

The `IconTextButton` component returns a `TouchableOpacity` component that contains an image and text on pressing the button, the opacity of the button is reduced thereby dimming it.

After creating two instances of the `IconTextButton`,
one for withdraw and transfer, we go back to the `MainLayout` to Dim the background. The idea is that if the TradeModal buttons are visible, then we dim the screen background 'behind'.

### Coingecko API Integration:

Aim: For the homescreen we want to build out the UI shown in the mockup; This will show the current wallet value with the option to tranfer(deposit) or withdraw as well as populating the screen with the current top Cryptocurrencies based on an API that we wil be using.

We integrate an API to achieve the above. The name of the API is Coingecko. We will be using react-redux-actions and the axios library.


--- 

## React Native Concepts Used:

- `NavigationContainer` - responsible for managing your app state and linking your top-level navigator to the app environment. 

- `Stack.Navigator` - provides a way for your app to transition between screens where each new screen is placed on top of a stack. The `initialRouteName` this is the route first rendered to the navigator.

- `Tab.Navigator` - A simple tab bar on the bottom of the screen that lets you switch between different routes. Routes are lazily initialized -- their screen components are not mounted until they are first focused.

- `tabBarButton` - Function which returns a React element to render as the tab bar button. It wraps the icon and label. Renders Pressable by default.

Note: We are able to nest navigators. This should be kept to a minimum where possible to reduce unnecessary memory consumption.

- `props` - components can be customized when they are created, with different parameters. These created parameters are called props. 

- `flex` - will define how your items are going to “fill” over the available space along your main axis.

- `TouchableOpacity` - A wrapper for making views respond properly to touches. On press down, the opacity of the wrapped view is decreased, dimming it.
>source: RN documentation.

--- 

## React Redux Concepts Used:

- `dispatch()` - A simple function that will be used to dispatch an action. This enables state change.

- **action** - Define action as an event that describes something that happened in the application.action as an event that describes something that happened in the application. an example action would be: {type: 'todos/todoAdded', payload: todoText}

- **reducer** - functions that take the current state and an action as arguements and return a new state. i.e (state,action) => newState. There will always be one root reducer function is responsible for handling all of the actions. This is regardless of if there are other reducers in other files.
you then use combineReducers.

-`combineReducers()` - A helper function that turns an object whose values are different reducing functions into a single reducing function you can pass to `createStore`.

- `createStore` - Creates a Redux store that holds the complete state tree of your app. There should only be a single store in your app.



>Source:  React-Redux documentation.
