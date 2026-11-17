/**
 * Le 72 pentadi (七十二候, shichijūni kō) nella versione giapponese
 * del 略本暦 (Ryakuhonreki, 1874), a partire da 立春 (longitudine solare 315°).
 * Fonte: tabella di ja.wikipedia.org/wiki/七十二候; traduzioni italiane libere.
 */

export interface PentadName {
	kanji: string;
	/** lettura in hiragana */
	kana: string;
	/** lettura giapponese in trascrizione Hepburn */
	romaji: string;
	/** traduzione italiana */
	nome: string;
}

export const PENTADS: PentadName[] = [
	// 立春
	{ kanji: '東風解凍', kana: 'はるかぜこおりをとく', romaji: 'harukaze kōri o toku', nome: 'Il vento dell’est scioglie il ghiaccio' },
	{ kanji: '黄鶯睍睆', kana: 'うぐいすなく', romaji: 'uguisu naku', nome: 'Canta l’usignolo giapponese' },
	{ kanji: '魚上氷', kana: 'うおこおりをいずる', romaji: 'uo kōri o izuru', nome: 'I pesci affiorano tra il ghiaccio' },
	// 雨水
	{ kanji: '土脉潤起', kana: 'つちのしょううるおいおこる', romaji: 'tsuchi no shō uruoi okoru', nome: 'La terra si inumidisce' },
	{ kanji: '霞始靆', kana: 'かすみはじめてたなびく', romaji: 'kasumi hajimete tanabiku', nome: 'La foschia comincia a stendersi' },
	{ kanji: '草木萌動', kana: 'そうもくめばえいずる', romaji: 'sōmoku mebae izuru', nome: 'Germogliano erbe e alberi' },
	// 啓蟄
	{ kanji: '蟄虫啓戸', kana: 'すごもりむしとをひらく', romaji: 'sugomori mushi to o hiraku', nome: 'Gli insetti in letargo aprono le porte' },
	{ kanji: '桃始笑', kana: 'ももはじめてさく', romaji: 'momo hajimete saku', nome: 'I peschi cominciano a fiorire' },
	{ kanji: '菜虫化蝶', kana: 'なむしちょうとなる', romaji: 'namushi chō to naru', nome: 'I bruchi diventano farfalle' },
	// 春分
	{ kanji: '雀始巣', kana: 'すずめはじめてすくう', romaji: 'suzume hajimete sukuu', nome: 'I passeri cominciano a fare il nido' },
	{ kanji: '桜始開', kana: 'さくらはじめてひらく', romaji: 'sakura hajimete hiraku', nome: 'I ciliegi cominciano a fiorire' },
	{ kanji: '雷乃発声', kana: 'かみなりすなわちこえをはっす', romaji: 'kaminari sunawachi koe o hassu', nome: 'Il tuono fa sentire la sua voce' },
	// 清明
	{ kanji: '玄鳥至', kana: 'つばめきたる', romaji: 'tsubame kitaru', nome: 'Arrivano le rondini' },
	{ kanji: '鴻雁北', kana: 'こうがんきたへかえる', romaji: 'kōgan kita e kaeru', nome: 'Le oche selvatiche tornano a nord' },
	{ kanji: '虹始見', kana: 'にじはじめてあらわる', romaji: 'niji hajimete arawaru', nome: 'Appaiono i primi arcobaleni' },
	// 穀雨
	{ kanji: '葭始生', kana: 'あしはじめてしょうず', romaji: 'ashi hajimete shōzu', nome: 'Spuntano le canne' },
	{ kanji: '霜止出苗', kana: 'しもやんでなえいづる', romaji: 'shimo yande nae izuru', nome: 'Cessa la brina, spuntano le piantine di riso' },
	{ kanji: '牡丹華', kana: 'ぼたんはなさく', romaji: 'botan hana saku', nome: 'Fioriscono le peonie' },
	// 立夏
	{ kanji: '蛙始鳴', kana: 'かわずはじめてなく', romaji: 'kawazu hajimete naku', nome: 'Le rane cominciano a cantare' },
	{ kanji: '蚯蚓出', kana: 'みみずいづる', romaji: 'mimizu izuru', nome: 'Escono i lombrichi' },
	{ kanji: '竹笋生', kana: 'たけのこしょうず', romaji: 'takenoko shōzu', nome: 'Spuntano i germogli di bambù' },
	// 小満
	{ kanji: '蚕起食桑', kana: 'かいこおきてくわをはむ', romaji: 'kaiko okite kuwa o hamu', nome: 'I bachi da seta si svegliano e mangiano il gelso' },
	{ kanji: '紅花栄', kana: 'べにばなさかう', romaji: 'benibana sakau', nome: 'Fiorisce il cartamo' },
	{ kanji: '麦秋至', kana: 'むぎのときいたる', romaji: 'mugi no toki itaru', nome: 'Arriva il tempo del grano maturo' },
	// 芒種
	{ kanji: '螳螂生', kana: 'かまきりしょうず', romaji: 'kamakiri shōzu', nome: 'Nascono le mantidi' },
	{ kanji: '腐草為蛍', kana: 'くされたるくさほたるとなる', romaji: 'kusaretaru kusa hotaru to naru', nome: 'L’erba marcita diventa lucciole' },
	{ kanji: '梅子黄', kana: 'うめのみきばむ', romaji: 'ume no mi kibamu', nome: 'Ingialliscono le prugne ume' },
	// 夏至
	{ kanji: '乃東枯', kana: 'なつかれくさかるる', romaji: 'natsukarekusa karuru', nome: 'Appassisce la prunella' },
	{ kanji: '菖蒲華', kana: 'あやめはなさく', romaji: 'ayame hana saku', nome: 'Fioriscono gli iris' },
	{ kanji: '半夏生', kana: 'はんげしょうず', romaji: 'hange shōzu', nome: 'Spunta la pinellia (hange)' },
	// 小暑
	{ kanji: '温風至', kana: 'あつかぜいたる', romaji: 'atsukaze itaru', nome: 'Arriva il vento caldo' },
	{ kanji: '蓮始開', kana: 'はすはじめてひらく', romaji: 'hasu hajimete hiraku', nome: 'I fiori di loto cominciano ad aprirsi' },
	{ kanji: '鷹乃学習', kana: 'たかすなわちわざをなす', romaji: 'taka sunawachi waza o nasu', nome: 'I giovani falchi imparano a volare' },
	// 大暑
	{ kanji: '桐始結花', kana: 'きりはじめてはなをむすぶ', romaji: 'kiri hajimete hana o musubu', nome: 'La paulonia forma i primi frutti' },
	{ kanji: '土潤溽暑', kana: 'つちうるおうてむしあつし', romaji: 'tsuchi uruōte mushiatsushi', nome: 'La terra è umida, il caldo afoso' },
	{ kanji: '大雨時行', kana: 'たいうときどきにふる', romaji: 'taiu tokidoki ni furu', nome: 'Cadono a tratti forti piogge' },
	// 立秋
	{ kanji: '涼風至', kana: 'すづかぜいたる', romaji: 'suzukaze itaru', nome: 'Arriva il vento fresco' },
	{ kanji: '寒蝉鳴', kana: 'ひぐらしなく', romaji: 'higurashi naku', nome: 'Cantano le cicale della sera' },
	{ kanji: '蒙霧升降', kana: 'ふかききりまとう', romaji: 'fukaki kiri matō', nome: 'Una fitta nebbia avvolge ogni cosa' },
	// 処暑
	{ kanji: '綿柎開', kana: 'わたのはなしべひらく', romaji: 'wata no hanashibe hiraku', nome: 'Si aprono le capsule del cotone' },
	{ kanji: '天地始粛', kana: 'てんちはじめてさむし', romaji: 'tenchi hajimete samushi', nome: 'Cielo e terra cominciano a rinfrescarsi' },
	{ kanji: '禾乃登', kana: 'こくものすなわちみのる', romaji: 'kokumono sunawachi minoru', nome: 'Maturano i cereali' },
	// 白露
	{ kanji: '草露白', kana: 'くさのつゆしろし', romaji: 'kusa no tsuyu shiroshi', nome: 'La rugiada biancheggia sull’erba' },
	{ kanji: '鶺鴒鳴', kana: 'せきれいなく', romaji: 'sekirei naku', nome: 'Cantano le ballerine' },
	{ kanji: '玄鳥去', kana: 'つばめさる', romaji: 'tsubame saru', nome: 'Partono le rondini' },
	// 秋分
	{ kanji: '雷乃収声', kana: 'かみなりすなわちこえをおさむ', romaji: 'kaminari sunawachi koe o osamu', nome: 'Il tuono tace' },
	{ kanji: '蟄虫坏戸', kana: 'むしかくれてとをふさぐ', romaji: 'mushi kakurete to o fusagu', nome: 'Gli insetti si rintanano e chiudono le porte' },
	{ kanji: '水始涸', kana: 'みずはじめてかる', romaji: 'mizu hajimete karu', nome: 'Si prosciugano le risaie' },
	// 寒露
	{ kanji: '鴻雁来', kana: 'こうがんきたる', romaji: 'kōgan kitaru', nome: 'Arrivano le oche selvatiche' },
	{ kanji: '菊花開', kana: 'きくのはなひらく', romaji: 'kiku no hana hiraku', nome: 'Fioriscono i crisantemi' },
	{ kanji: '蟋蟀在戸', kana: 'きりぎりすとにあり', romaji: 'kirigirisu to ni ari', nome: 'I grilli cantano sulla soglia' },
	// 霜降
	{ kanji: '霜始降', kana: 'しもはじめてふる', romaji: 'shimo hajimete furu', nome: 'Cade la prima brina' },
	{ kanji: '霎時施', kana: 'こさめときどきふる', romaji: 'kosame tokidoki furu', nome: 'Cadono a tratti piogge leggere' },
	{ kanji: '楓蔦黄', kana: 'もみじつたきばむ', romaji: 'momiji tsuta kibamu', nome: 'Aceri ed edere si tingono di colore' },
	// 立冬
	{ kanji: '山茶始開', kana: 'つばきはじめてひらく', romaji: 'tsubaki hajimete hiraku', nome: 'Le camelie cominciano a fiorire' },
	{ kanji: '地始凍', kana: 'ちはじめてこおる', romaji: 'chi hajimete kōru', nome: 'La terra comincia a gelare' },
	{ kanji: '金盞香', kana: 'きんせんかさく', romaji: 'kinsenka saku', nome: 'Profumano i narcisi' },
	// 小雪
	{ kanji: '虹蔵不見', kana: 'にじかくれてみえず', romaji: 'niji kakurete miezu', nome: 'L’arcobaleno si nasconde' },
	{ kanji: '朔風払葉', kana: 'きたかぜこのはをはらう', romaji: 'kitakaze konoha o harau', nome: 'Il vento del nord spazza le foglie' },
	{ kanji: '橘始黄', kana: 'たちばなはじめてきばむ', romaji: 'tachibana hajimete kibamu', nome: 'Gli agrumi tachibana cominciano a ingiallire' },
	// 大雪
	{ kanji: '閉塞成冬', kana: 'そらさむくふゆとなる', romaji: 'sora samuku fuyu to naru', nome: 'Il cielo si chiude, è inverno' },
	{ kanji: '熊蟄穴', kana: 'くまあなにこもる', romaji: 'kuma ana ni komoru', nome: 'Gli orsi si ritirano nelle tane' },
	{ kanji: '鱖魚群', kana: 'さけのうおむらがる', romaji: 'sake no uo muragaru', nome: 'I salmoni risalgono in branchi' },
	// 冬至
	{ kanji: '乃東生', kana: 'なつかれくさしょうず', romaji: 'natsukarekusa shōzu', nome: 'Spunta la prunella' },
	{ kanji: '麋角解', kana: 'おおしかのつのおつる', romaji: 'ōshika no tsuno otsuru', nome: 'I cervi perdono le corna' },
	{ kanji: '雪下出麦', kana: 'ゆきわたりてむぎいづる', romaji: 'yuki watarite mugi izuru', nome: 'Sotto la neve spunta il grano' },
	// 小寒
	{ kanji: '芹乃栄', kana: 'せりすなわちさかう', romaji: 'seri sunawachi sakau', nome: 'Il crescione seri cresce rigoglioso' },
	{ kanji: '水泉動', kana: 'しみずあたたかをふくむ', romaji: 'shimizu atataka o fukumu', nome: 'Le sorgenti si intiepidiscono' },
	{ kanji: '雉始雊', kana: 'きじはじめてなく', romaji: 'kiji hajimete naku', nome: 'Il fagiano comincia a chiamare' },
	// 大寒
	{ kanji: '款冬華', kana: 'ふきのはなさく', romaji: 'fuki no hana saku', nome: 'Fiorisce il farfaraccio' },
	{ kanji: '水沢腹堅', kana: 'さわみずこおりつめる', romaji: 'sawamizu kōri tsumeru', nome: 'L’acqua delle paludi gela in profondità' },
	{ kanji: '鶏始乳', kana: 'にわとりはじめてとやにつく', romaji: 'niwatori hajimete toya ni tsuku', nome: 'Le galline cominciano a covare' }
];

/** Nome della pentade che inizia alla longitudine solare indicata (multiplo di 5°). */
export function pentadName(longitude: number): PentadName {
	return PENTADS[((((longitude - 315) % 360) + 360) % 360) / 5];
}
