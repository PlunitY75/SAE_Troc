import React from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator} from '@react-navigation/bottom-tabs';



import AccueilScreen from './Screens/AccueilScreen';
import CompteScreen from './Screens/CompteScreen';
import MessagerieScreen from './Screens/MessagerieScreen';
import AjoutAnnonceScreen from './Screens/AjoutAnnonceScreen';
import RegisterScreen from './Screens/Login/RegisterScreen';
import LoginScreen from './Screens/Login/LoginScreen'
import AnnonceModifScreen from './Screens/Reglages/AnnonceModifScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: true }}>
                <Stack.Screen name="Home" component={TabNav} options={{ title: 'Troc & Co' }}/>
                <Stack.Screen name="Accueil" component={AccueilScreen} options={{ title: 'Accueil' }} />
                <Stack.Screen name="CompteScreen" component={AccueilScreen} options={{title: 'Mon compte'}}/>
                <Stack.Screen name="Messagerie" component={MessagerieScreen} options={{title: 'Messagerie'}}/>
                <Stack.Screen name="AjoutAnnonce" component={AjoutAnnonceScreen} options={{title: 'Ajouter une annonce'}}/>
                <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{title: 'Nouveau Compte'}}/>
                <Stack.Screen name="LoginScreen" component={LoginScreen} options={{title: 'Connexion'}}/>
                <Stack.Screen name="AnnonceModifScreen" component={AnnonceModifScreen} options={{title: 'Modifier votre annonce'}}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const TabNav = () => (
    <Tab.Navigator screenOptions={{tabBarShowLabel: false}}>
        <Tab.Screen name="Accueil" component={AccueilScreen} 
            options={{
                title:"Accueil",
                headerShown:false,
                tabBarIcon: ({ focused }) => (
                <Image
                    source={require('./images/accueil.png')}
                    style={{ width: 30, height: 30 }}/>
                )
        }}
        />
                <Tab.Screen name="AjoutAnnonce" component={AjoutAnnonceScreen} 
            options={{
                title:"AjoutAnnonce",
                headerShown:false,
                tabBarIcon: ({ focused }) => (
                <Image
                    source={require('./images/nouvelleannonce.png')}
                    style={{ width: 30, height: 30 }}/>
                )
        }}
        />
        <Tab.Screen name="Messagerie" component={MessagerieScreen} 
            options={{
                title:"Messagerie",
                headerShown:false,
                tabBarIcon: ({ focused }) => (
                <Image
                    source={require('./images/messagerie.png')}
                    style={{ width: 30, height: 30 }}/>
                )
        }}
        />
        <Tab.Screen name="Mon Compte" component={CompteScreen} 
            options={{
                title:"Mon Compte",
                headerShown:false,
                tabBarIcon: ({ focused }) => (
                <Image
                    source={require('./images/compte.png')}
                    style={{ width: 30, height: 30 }}/>
                )
        }}
        />
        
    </Tab.Navigator>
);
