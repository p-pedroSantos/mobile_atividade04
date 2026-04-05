import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Configuração dos temas visual (Dia e Noite)
const temas = {
  dia: {
    coresFundo: ['#47BFDF', '#4A91FF'], // Azul claro inspirado no seu Figma
    corCartao: 'rgba(255, 255, 255, 0.3)', // Efeito Glassmorphism claro
  },
  noite: {
    coresFundo: ['#08244F', '#134CB5'], // Azul escuro do Figma
    corCartao: 'rgba(255, 255, 255, 0.15)', // Efeito Glassmorphism escuro
  }
};

// Função auxiliar para escolher o ícone baseado na condição da API
const obterIconeClima = (condicao) => {
  const icones = {
    clear_day: 'sunny',
    clear_night: 'moon',
    cloud: 'cloud',
    cloudly_day: 'partly-sunny',
    cloudly_night: 'cloudy-night',
    rain: 'rainy',
    storm: 'thunderstorm',
  };
  return icones[condicao] || 'cloud-outline';
};

export default function TelaClima() {
  // Estados do nosso aplicativo
  const [dadosClima, setDadosClima] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [ehDia, setEhDia] = useState(true);

  // Função que busca os dados da API
const buscarClimaDaApi = async () => {
    try {
      // Adicionamos o format=json-cors para evitar bloqueios na Web
      const url = 'https://api.hgbrasil.com/weather?key=ba94c742&city_name=Recife,PE&format=json-cors';
      const resposta = await fetch(url);
      const json = await resposta.json();
      
      // ISSO AQUI É O NOSSO DETETIVE: Vai imprimir o que a API respondeu no seu terminal!
      console.log("=== DADOS RECEBIDOS DA API ===");
      console.log(json);
      
      // Verifica se a API realmente mandou a propriedade "results"
      if (json.results) {
        setDadosClima(json.results);
        setEhDia(json.results.currently === 'dia');
      } else {
        console.log("ALERTA: A API não enviou os dados climáticos. Veja o erro acima no console.");
      }
      
    } catch (erro) {
      console.error("Erro na requisição:", erro);
    } finally {
      setCarregando(false);
    }
  };

  // Roda a função de busca assim que a tela abre
  useEffect(() => {
    buscarClimaDaApi();
  }, []);

  // Tela de carregamento enquanto a API responde
  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', backgroundColor: '#08244F' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={{ color: 'white', marginTop: 10 }}>Buscando clima...</Text>
      </View>
    );
  }

  // Define qual tema usar baseado na resposta da API
  const temaAtual = ehDia ? temas.dia : temas.noite;

  return (
    <LinearGradient colors={temaAtual.coresFundo} style={styles.container}>
      <ScrollView contentContainerStyle={styles.conteudoRoleavel}>
        
        {/* CABEÇALHO */}
        <View style={styles.cabecalho}>
          <View style={styles.localizacaoContainer}>
            <Ionicons name="location-outline" size={24} color="white" />
            <Text style={styles.textoCidade}>{dadosClima?.city}</Text>
            <Ionicons name="chevron-down" size={16} color="white" />
          </View>
          <Ionicons name="notifications-outline" size={24} color="white" />
        </View>

        {/* INFORMAÇÃO PRINCIPAL */}
        <View style={styles.infoPrincipal}>
          {/* Aqui você pode trocar pelo seu ícone 3D depois usando a tag <Image /> */}
          <Ionicons 
            name={obterIconeClima(dadosClima?.condition_slug)} 
            size={120} 
            color={ehDia ? '#FFD700' : '#FFFFFF'} 
          />
          <Text style={styles.textoTemperaturaGrande}>{dadosClima?.temp}°</Text>
          <Text style={styles.textoDescricao}>{dadosClima?.description}</Text>
          <Text style={styles.textoMaxMin}>
            Max.: {dadosClima?.forecast[0].max}°   Min.: {dadosClima?.forecast[0].min}°
          </Text>
        </View>

        {/* CARTÃO DE ESTATÍSTICAS (Vento, Umidade, etc) */}
        <View style={[styles.cartao, { backgroundColor: temaAtual.corCartao, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15 }]}>
          <View style={styles.itemEstatistica}>
            <Ionicons name="water-outline" size={20} color="white" />
            <Text style={styles.textoEstatistica}>{dadosClima?.humidity}%</Text>
          </View>
          <View style={styles.itemEstatistica}>
            <Ionicons name="cloud-download-outline" size={20} color="white" />
            <Text style={styles.textoEstatistica}>{dadosClima?.cloudiness}%</Text>
          </View>
          <View style={styles.itemEstatistica}>
            <Ionicons name="speedometer-outline" size={20} color="white" />
            <Text style={styles.textoEstatistica}>{dadosClima?.wind_speedy}</Text>
          </View>
        </View>

       {/* CARTÃO: PRÓXIMOS DIAS */}
<View style={[styles.cartao, { backgroundColor: temaAtual.corCartao, marginTop: 20 }]}>
  <View style={styles.cabecalhoCartao}>
    <Text style={styles.tituloCartao}>Próximos Dias</Text>
    <Ionicons name="calendar-outline" size={20} color="white" />
  </View>
  
  {/* Mapeia o array 'forecast' que vem da API */}
  {dadosClima?.forecast.map((diaPrevisao, indice) => (
    <View key={indice} style={styles.linhaPrevisaoDia}>
      {/* Nome do dia (Ex: Seg, Ter) */}
      <Text style={styles.textoDiaDaSemana}>{diaPrevisao.weekday}</Text>
      
      {/* Ícone baseado na condição do dia */}
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Ionicons 
          name={obterIconeClima(diaPrevisao.condition)} 
          size={24} 
          color="white" 
        />
      </View>

      {/* Temperaturas Máxima e Mínima */}
      <Text style={styles.textoTemperaturasDia}>
        {diaPrevisao.max}°  
        <Text style={{ opacity: 0.5, fontWeight: 'normal' }}> {diaPrevisao.min}°</Text>
      </Text>
    </View>
  ))}
</View>

      </ScrollView>
    </LinearGradient>
  );
}

// ESTILOS (CSS)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conteudoRoleavel: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  localizacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoCidade: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  infoPrincipal: {
    alignItems: 'center',
    marginBottom: 30,
  },
  textoTemperaturaGrande: {
    color: 'white',
    fontSize: 90,
    fontWeight: 'bold',
    marginTop: -10,
  },
  textoDescricao: {
    color: 'white',
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 5,
  },
  textoMaxMin: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  cartao: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  itemEstatistica: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoEstatistica: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cabecalhoCartao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tituloCartao: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linhaPrevisaoDia: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  textoDiaDaSemana: {
    color: 'white',
    fontSize: 16,
    width: 80,
    fontWeight: '500',
  },
  textoTemperaturasDia: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});