import React, { createContext, useState } from 'react'; // Import correct
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator} from '@react-navigation/bottom-tabs';



import AccueilScreen from './Screens/AccueilScreen';
import CompteScreen from './Screens/CompteScreen';
import MessagerieScreen from './Screens/MessagerieScreen';
import ConversationScreen from './Screens/ConversationScreen'; // Import du nouvel écran
import AjoutAnnonceScreen from './Screens/AjoutAnnonceScreen';
import RegisterScreen from './Screens/Login/RegisterScreen';
import LoginScreen from './Screens/Login/LoginScreen'
import AnnonceModifScreen from './Screens/Reglages/AnnonceModifScreen';

export const ConversationsContext = createContext();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
    // Gestion des conversations dans un état global
    const [conversations, setConversations] = useState([
      { id: '1', name: 'Fael Darosa', messages: [{ id: '1', text: 'Salut, comment ça va ?', sender: 'other' }] },
      { id: '2', name: 'Yassin Zrelli', messages: [{ id: '1', text: 'Tu peux baisser le prix ?', sender: 'other' }] },
      { id: '3', name: 'Eric Zhang', messages: [{ id: '1', text: 'On peut discuter du troc ?', sender: 'other' }] },
      { id: '4', name: 'Youssef Bakli', messages: [{ id: '1', text: 'Top ! Merci beaucoup.', sender: 'other' }] },
      { id: '5', name: 'Lucas Nurminen', messages: [{ id: '1', text: 'Une casquette de dispo ?', sender: 'other' }] },
    ]); // Ajouté pour gérer dynamiquement les messages de chaque conversation
  
    return (
      // Envelopper l'application dans ConversationsContext.Provider pour partager les conversations
      <ConversationsContext.Provider value={{ conversations, setConversations }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: true }}>
            <Stack.Screen name="Home" component={TabNav} options={{ title: 'Troc & Co' }} />
            <Stack.Screen name="Messagerie" component={MessagerieScreen} options={{ title: 'Messagerie' }} />
            <Stack.Screen name="Conversation" component={ConversationScreen} options={{ title: 'Conversation' }} />
            <Stack.Screen name="Accueil" component={AccueilScreen} options={{ title: 'Accueil' }} />
            <Stack.Screen name="AjoutAnnonce" component={AjoutAnnonceScreen} options={{ title: 'Ajouter une annonce' }} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ title: 'Nouveau Compte' }} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: 'Connexion' }} />
            <Stack.Screen name="AnnonceModifScreen" component={AnnonceModifScreen} options={{ title: 'Modifier votre annonce' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ConversationsContext.Provider>
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
