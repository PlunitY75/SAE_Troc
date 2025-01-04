import { StatusBar } from "expo-status-bar";
import { View, TextInput, StyleSheet, ScrollView, Text, Button, TouchableOpacity, FlatList } from 'react-native';
import Card from '../composants/Card.js';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from "@react-navigation/native";

export default function App() {
    const navigation = useNavigation();
    const connexionRedirection = () => {
        navigation.navigate("CompteScreen");
    };
    const cards = [
        { id: '1', image: require('../images/guitare1.jpg'), title: 'Guitare 1', description: 'Une superbe guitare guitareguitareguitareguitareguitareguitaredescriptiondescription!', price: '15€', date:'03/01/2025' },
        { id: '2', image: require('../images/guitare2.jpg'), title: 'Guitare 2', description: 'Guitare électrique cool.', price: '25€' },
        { id: '3', image: require('../images/guitare3.jpg'), title: 'Guitare 3', description: 'Guitare acoustique vintage.', price: '30€' },
    ];
    const cardsbis = [
        { id: '1', image: require('../images/guitare1.jpg'), title: 'Guitare 1', description: 'Une superbe guitare guitareguitareguitareguitareguitareguitaredescriptiondescription!', price: '15€ / Semaine', date:'03/01/2025' },
        { id: '2', image: require('../images/guitare2.jpg'), title: 'Guitare 2', description: 'Guitare électrique cool.', price: '25€ / Jour' },
        { id: '3', image: require('../images/guitare3.jpg'), title: 'Guitare 3', description: 'Guitare acoustique vintage.', price: '30€ / Jour' },
    ];

    return (
        <View style={styles.container}>
            {/* Barre de recherche */}
            <View style={styles.topNavBarContainer}>
                <TouchableOpacity style={styles.navBarButton} onPress={() => { connexionRedirection() }}>
                    <MaterialCommunityIcons name="account" size={35} color="#687a86" />
                </TouchableOpacity>

                <TextInput
                    placeholder="Rechercher des articles"
                    style={styles.input}
                />

                <TouchableOpacity style={styles.navBarButton} onPress={() => { console.log("touch") }}>
                    <FontAwesome5 name="shopping-cart" size={24} color="#687a86" />
                </TouchableOpacity>
            </View>

            {/* Contenu défilant */}
            <ScrollView contentContainerStyle={styles.scrollViewContent} >
                <View style={styles.tendanceContainer} >
                    <Text style={styles.tendanceTitle}>Les tendances du moment !</Text>
                    <FlatList
                        data={cards}
                        renderItem={({ item }) => (
                            <Card
                                imageSource={item.image}
                                title={item.title}
                                description={item.description}
                                price={item.price}
                                date={item.date}
                            />
                        )}
                        keyExtractor={item => item.id}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carrousel}
                    />
                </View>
                <View style={styles.locationContainer}>
                    <Text style={styles.locationTitle}>Les locations du moment !</Text>
                    <FlatList
                        data={cardsbis}
                        renderItem={({ item }) => (
                            <Card
                                imageSource={item.image}
                                title={item.title}
                                description={item.description}
                                price={item.price}
                                date={item.date}
                            />
                        )}
                        keyExtractor={item => item.id}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carrousel}
                    />
                </View>

                {/* Articles supplémentaires */}
                {Array.from({ length: 20 }, (_, i) => (
                    <Text key={i} style={styles.item}>
                        Article {i + 1}
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ddd'
    },
    topNavBarContainer: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        zIndex: 1,
    },
    navBarButton: {
        backgroundColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        borderRadius: 15,
    },
    input: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 15,
        borderWidth: 1,
        flex: 1,
        marginRight: 10,
        marginLeft: 10,
        borderColor: '#ddd',
    },
    tendanceContainer: {
        width: '100%',
        flexDirection: 'column',
        paddingTop: 30,
        paddingBottom: 20,
        backgroundColor: '#f5f5f5',
    },
    tendanceTitle: {
        fontSize: 20,
        fontWeight: '500',
        marginLeft: 10,
        marginBottom:15
    },
    carrousel: {
        paddingLeft: 10,
        paddingRight: 10,
    },

    locationContainer:{
        width: '100%',
        flexDirection: 'column',
        paddingTop: 30,
        paddingBottom: 20,
        marginTop:20,
        backgroundColor: '#f5f5f5',
    },

    locationTitle:{
        fontSize: 20,
        fontWeight: '500',
        marginLeft: 10,
        marginBottom:15
    },
    scrollViewContent: {

    },
    item: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
});
