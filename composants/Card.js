import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const Card = ({ imageSource, title, description, price, date, }) => {
    // Fonction pour tronquer la description
    const truncateText = () => {
        return description.length > 80 ? description.substring(0, 60) + "..." : description;
    };

    return (
        <View style={styles.cardContainer}>
            {/* Image */}
            <Image source={imageSource} style={styles.cardImage} />
            {/* Informations */}
            <View style={styles.cardInfo}>
                <View>
                    <Text style={styles.cardTitle}>{title}</Text>
                    {/* Description tronquée */}
                    <Text style={styles.cardDescription}>{truncateText(description, 50)}</Text>
                </View>
                <View style={styles.bottomCardContainer}>
                    <Text style={styles.cardPrice}>{price}</Text>
                    <Text style={styles.cardDate}>{date}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: 200,
        margin: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    cardImage: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        resizeMode: 'contain',
        height: 150,
        backgroundColor: '#ddd',
    },
    cardInfo: {
        padding: 10,
        justifyContent:'space-between',
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    bottomCardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'green',
    },
    cardDate: {
        fontSize: 10,
        color: 'grey',
    },
});

export default Card;
