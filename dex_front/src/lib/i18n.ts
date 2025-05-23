import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        interpolation: {escapeValue: false},
        resources: {
            en: {
                translation: {
                    "wallet.title": "Wallet",
                    "wallet.basic": "BASIC",
                    "wallet.balance": "Balance",
                    "wallet.error_nonzero_balance": "Balance must be zero to close account",
                    "wallet.pro": "PRO",
                    "wallet.label": "Wallet",
                    "wallet.send": "Send",
                    "wallet.closedAccount": "CLOSED ACCOUNT",
                    "wallet.receive": "Receive",
                    "wallet.close": "Close Account",
                    "wallet.connect": "Connect Wallet",
                    "wallet.totalbalance": "Total Balance",
                    "wallet.appInteraction": "APP INTERACTION",
                    "wallet.copied": "Address copied to clipboard",
                    "wallet.sending": "Sending transaction...",
                    "wallet.sendSuccess": "Transaction successful!",
                    "wallet.sendFailed": "Transaction failed!",
                    "wallet.assets": "Assets",
                    "wallet.received": "RECEIVED",
                    "wallet.sent": "SENT",
                    "wallet.unknown": "UNKNOWN",
                    "wallet.amount": "Amount",
                    "wallet.cancel": "Cancel",
                    "wallet.transactions": "Transactions",
                    "wallet.viewOnSolscan": "View on Solscan",
                    "wallet.sendErrorMissing": "Wallet or token info missing",
                    "settings.language": "Language",
                    "settings.theme": "Switch theme",
                    "settings.label": "Settings",
                    "swap.label": "Swap",
                    "swap.from": "From",
                    "swap.to": "To",
                    "swap.button": "Swap",
                    "swap.balance": "Balance",
                    "swap.insufficient": "Insufficient",
                    "swap.max": "Max",
                    "token.select": "Select token",
                    "token.search": "Search token...",
                    "token.popular": "Popular Tokens",
                    "token.all": "All Tokens",
                    "token.none": "No tokens found",
                    "token.loading": "Loading...",
                    "token.unknown": "Unknown Token",
                    "tx.success": "Success",
                    "tx.failed": "Failed",
                    "tx.none": "No transactions found",
                    "tx.recipient": "Recipient",
                    "tx.recipientPlaceholder": "Solana address",
                    "loading.title": "Loading...",
                    "loading.more": "Loading more...",
                    "loading.error": "Error loading more",
                    "loading.noMore": "No more transactions",
                    "date.yesterday": "Yesterday",
                    "date.today": "Today",
                },
            },
            ru: {
                translation: {
                    "wallet.title": "Кошелек",
                    "wallet.basic": "ОСН",
                    "wallet.balance": "Баланс",
                    "wallet.pro": "ПРО",
                    "wallet.label": "Кошелек",
                    "wallet.send": "Отправить",
                    "wallet.receive": "Получить",
                    "wallet.close": "Закрыть аккаунт",
                    "wallet.connect": "Подключить кошелек",
                    "wallet.totalbalance": "Общий баланс",
                    "wallet.copied": "Адрес скопирован",
                    "wallet.sending": "Отправка транзакции...",
                    "wallet.sendSuccess": "Транзакция успешна!",
                    "wallet.sendFailed": "Ошибка транзакции!",
                    "wallet.appInteraction": "ВЗАИМОДЕЙСТВИЕ С ПРИЛОЖЕНИЕМ",
                    "wallet.assets": "Активы",
                    "wallet.amount": "Сумма",
                    "wallet.error_nonzero_balance": "Баланс должен быть равен нулю, чтобы закрыть аккаунт",
                    "wallet.cancel": "Отмена",
                    "wallet.closedAccount": "АККАУНТ ЗАКРЫТ",
                    "wallet.sent": "ОТПРАВЛЕНО",
                    "wallet.received": "ПОЛУЧЕНО",
                    "wallet.unknown": "НЕИЗВЕСТНО",
                    "wallet.transactions": "Транзакции",
                    "wallet.viewOnSolscan": "Посмотреть в Solscan",
                    "wallet.sendErrorMissing": "Нет информации о кошельке или токене",
                    "settings.language": "Язык",
                    "settings.theme": "Переключить тему",
                    "settings.label": "Настройки",
                    "swap.label": "Обмен",
                    "swap.button": "Обмен",
                    "swap.balance": "Баланс",
                    "swap.from": "Из",
                    "swap.insufficient": "Недостаточно",
                    "swap.to": "В",
                    "swap.max": "Макс",
                    "token.select": "Выбрать токен",
                    "token.search": "Поиск токена...",
                    "token.popular": "Популярные токены",
                    "token.all": "Все токены",
                    "token.none": "Токены не найдены",
                    "token.loading": "Загрузка...",
                    "token.unknown": "Неизвестный токен",
                    "tx.success": "Успешно",
                    "tx.failed": "Не удалось",
                    "tx.none": "Транзакции не найдены",
                    "tx.recipient": "Получатель",
                    "tx.recipientPlaceholder": "Адрес Solana",
                    "loading.title": "Загрузка...",
                    "loading.more": "Загрузка дополнительных данных...",
                    "loading.error": "Ошибка при загрузке",
                    "loading.noMore": "Больше транзакций нет",
                    "date.yesterday": "Вчера",
                    "date.today": "Сегодня",
                },
            },
            zh: {
                translation: {
                    "wallet.title": "钱包",
                    "wallet.basic": "基础",
                    "wallet.balance": "余额",
                    "wallet.pro": "专业",
                    "wallet.label": "钱包",
                    "wallet.send": "发送",
                    "wallet.receive": "接收",
                    "wallet.error_nonzero_balance": "余额必须为零才能关闭账户",
                    "wallet.close": "关闭账户",
                    "wallet.connect": "连接钱包",
                    "wallet.totalbalance": "总余额",
                    "wallet.appInteraction": "应用交互",
                    "wallet.copied": "地址已复制",
                    "wallet.sending": "发送交易中...",
                    "wallet.sendSuccess": "交易成功！",
                    "wallet.sendFailed": "交易失败！",
                    "wallet.assets": "资产",
                    "wallet.amount": "金额",
                    "wallet.cancel": "取消",
                    "wallet.sent": "已发送",
                    "wallet.received": "已接收",
                    "wallet.unknown": "未知",
                    "wallet.closedAccount": "账户已关闭",
                    "wallet.transactions": "交易记录",
                    "wallet.viewOnSolscan": "在 Solscan 上查看",
                    "wallet.sendErrorMissing": "钱包或代币信息缺失",
                    "settings.theme": "切换主题",
                    "settings.language": "语言",
                    "settings.label": "设置",
                    "swap.label": "兑换",
                    "swap.insufficient": "余额不足",
                    "swap.button": "兑换",
                    "swap.balance": "余额",
                    "swap.max": "最大",
                    "swap.from": "从",
                    "swap.to": "到",
                    "token.select": "选择代币",
                    "token.search": "搜索代币...",
                    "token.popular": "热门代币",
                    "token.all": "所有代币",
                    "token.none": "未找到代币",
                    "token.loading": "加载中...",
                    "token.unknown": "未知代币",
                    "tx.success": "成功",
                    "tx.failed": "失败",
                    "tx.none": "没有找到交易",
                    "tx.recipient": "收款人",
                    "tx.recipientPlaceholder": "Solana 地址",
                    "loading.title": "加载中...",
                    "loading.more": "加载更多...",
                    "loading.error": "加载更多时出错",
                    "loading.noMore": "没有更多交易",
                    "date.yesterday": "昨天",
                    "date.today": "今天",
                },
            },
            es: {
                translation: {
                    "wallet.title": "Billetera",
                    "wallet.basic": "BÁSICO",
                    "wallet.balance": "Saldo",
                    "wallet.pro": "PRO",
                    "wallet.label": "Billetera",
                    "wallet.send": "Enviar",
                    "wallet.appInteraction": "INTERACCIÓN DE LA APLICACIÓN",
                    "wallet.receive": "Recibir",
                    "wallet.close": "CERRAR CUENTA",
                    "wallet.connect": "Conectar billetera",
                    "wallet.totalbalance": "Saldo total",
                    "wallet.copied": "Dirección copiada",
                    "wallet.sending": "Enviando transacción...",
                    "wallet.sendSuccess": "¡Transacción exitosa!",
                    "wallet.sendFailed": "¡Transacción fallida!",
                    "wallet.assets": "Activos",
                    "wallet.amount": "Cantidad",
                    "wallet.error_nonzero_balance":
                        "El saldo debe ser cero para cerrar la cuenta",
                    "wallet.cancel": "Cancelar",
                    "wallet.closedAccount": "Cuenta cerrada",
                    "wallet.sent": "ENVIADO",
                    "wallet.received": "RECIBIDO",
                    "wallet.unknown": "DESCONOCIDO",
                    "wallet.transactions": "Transacciones",
                    "wallet.viewOnSolscan": "Ver en Solscan",
                    "wallet.sendErrorMissing": "Falta información de billetera o token",
                    "settings.theme": "Cambiar tema",
                    "settings.language": "Idioma",
                    "settings.label": "Ajustes",
                    "swap.label": "Intercambiar",
                    "swap.button": "Intercambiar",
                    "swap.insufficient": "Saldo insuficiente",
                    "swap.balance": "Saldo",
                    "swap.max": "Máx",
                    "swap.from": "Desde",
                    "swap.to": "A",
                    "token.select": "Seleccionar token",
                    "token.search": "Buscar token...",
                    "token.popular": "Tokens populares",
                    "token.all": "Todos los tokens",
                    "token.none": "No se encontraron tokens",
                    "token.loading": "Cargando...",
                    "token.unknown": "Token desconocido",
                    "tx.success": "Éxito",
                    "tx.failed": "Fallido",
                    "tx.none": "No se encontraron transacciones",
                    "tx.recipient": "Destinatario",
                    "tx.recipientPlaceholder": "Dirección de Solana",
                    "loading.title": "Cargando...",
                    "loading.more": "Cargando más...",
                    "loading.error": "Error al cargar más",
                    "loading.noMore": "No hay más transacciones",
                    "date.yesterday": "Ayer",
                    "date.today": "Hoy",
                },
            },
            "zh-Hant": {
                translation: {
                    "wallet.title": "錢包",
                    "wallet.basic": "基本",
                    "wallet.balance": "餘額",
                    "wallet.pro": "進階",
                    "wallet.label": "錢包",
                    "wallet.send": "發送",
                    "wallet.receive": "接收",
                    "wallet.close": "關閉帳戶",
                    "wallet.connect": "連接錢包",
                    "wallet.appInteraction": "應用交互",
                    "wallet.totalbalance": "總餘額",
                    "wallet.copied": "地址已複製",
                    "wallet.sending": "正在發送交易...",
                    "wallet.error_nonzero_balance": "餘額必須為零才能關閉帳戶",
                    "wallet.sendSuccess": "交易成功！",
                    "wallet.sendFailed": "交易失敗！",
                    "wallet.sent": "已發送",
                    "wallet.received": "已接收",
                    "wallet.unknown": "未知",
                    "wallet.assets": "資產",
                    "wallet.amount": "金額",
                    "wallet.cancel": "取消",
                    "wallet.closedAccount": "帳戶已關閉",
                    "wallet.transactions": "交易記錄",
                    "wallet.viewOnSolscan": "在 Solscan 上查看",
                    "wallet.sendErrorMissing": "缺少錢包或代幣資訊",
                    "settings.language": "語言",
                    "settings.theme": "切換主題",
                    "settings.label": "設定",
                    "swap.label": "交換",
                    "swap.button": "交換",
                    "swap.insufficient": "餘額不足",
                    "swap.balance": "餘額",
                    "swap.max": "最大",
                    "swap.from": "從",
                    "swap.to": "到",
                    "token.select": "選擇代幣",
                    "token.search": "搜尋代幣...",
                    "token.popular": "熱門代幣",
                    "token.all": "所有代幣",
                    "token.none": "找不到代幣",
                    "token.loading": "載入中...",
                    "token.unknown": "未知代幣",
                    "tx.success": "成功",
                    "tx.failed": "失敗",
                    "tx.none": "找不到交易記錄",
                    "tx.recipient": "收款人",
                    "tx.recipientPlaceholder": "Solana 地址",
                    "loading.title": "載入中...",
                    "loading.more": "載入更多...",
                    "loading.error": "載入更多時發生錯誤",
                    "loading.noMore": "沒有更多交易",
                    "date.yesterday": "昨天",
                    "date.today": "今天",
                },
            },
            ja: {
                translation: {
                    "wallet.title": "ウォレット",
                    "wallet.basic": "ベーシック",
                    "wallet.balance": "残高",
                    "wallet.pro": "プロ",
                    "wallet.label": "ウォレット",
                    "wallet.send": "送信",
                    "wallet.receive": "受信",
                    "wallet.close": "アカウントを閉じる",
                    "wallet.connect": "ウォレットを接続",
                    "wallet.error_nonzero_balance":
                        "アカウントを閉じるには残高がゼロである必要があります",
                    "wallet.totalbalance": "合計残高",
                    "wallet.appInteraction": "アプリの相互作用",
                    "wallet.copied": "アドレスをコピーしました",
                    "wallet.sending": "トランザクションを送信中...",
                    "wallet.sendSuccess": "トランザクション成功！",
                    "wallet.sendFailed": "トランザクション失敗！",
                    "wallet.assets": "資産",
                    "wallet.amount": "金額",
                    "wallet.cancel": "キャンセル",
                    "wallet.sent": "送信済み",
                    "wallet.received": "受信済み",
                    "wallet.unknown": "不明",
                    "wallet.transactions": "取引履歴",
                    "wallet.viewOnSolscan": "Solscanで表示",
                    "wallet.sendErrorMissing":
                        "ウォレットまたはトークン情報が不足しています",
                    "settings.language": "言語",
                    "settings.theme": "テーマを切り替え",
                    "settings.label": "設定",
                    "swap.label": "スワップ",
                    "swap.button": "スワップ",
                    "swap.balance": "残高",
                    "swap.insufficient": "残高不足",
                    "swap.max": "最大",
                    "swap.from": "送信元",
                    "swap.to": "送信先",
                    "token.select": "トークンを選択",
                    "token.search": "トークンを検索...",
                    "token.popular": "人気トークン",
                    "token.all": "すべてのトークン",
                    "token.none": "トークンが見つかりません",
                    "token.loading": "読み込み中...",
                    "token.unknown": "不明なトークン",
                    "tx.success": "成功",
                    "tx.failed": "失敗",
                    "tx.none": "取引が見つかりません",
                    "tx.recipient": "受取人",
                    "tx.recipientPlaceholder": "Solanaアドレス",
                    "loading.title": "読み込み中...",
                    "loading.more": "さらに読み込み中...",
                    "loading.error": "読み込み中にエラーが発生しました",
                    "loading.noMore": "これ以上の取引はありません",
                    "date.yesterday": "昨日",
                    "date.today": "今日",
                },
            },
            ko: {
                translation: {
                    "wallet.title": "지갑",
                    "wallet.basic": "기본",
                    "wallet.balance": "잔액",
                    "wallet.pro": "전문가",
                    "wallet.label": "지갑",
                    "wallet.send": "보내기",
                    "wallet.receive": "받기",
                    "wallet.close": "계정 닫기",
                    "wallet.error_nonzero_balance": "잔액이 0이어야 계정을 닫을 수 있습니다",
                    "wallet.connect": "지갑 연결",
                    "wallet.totalbalance": "총 잔액",
                    "wallet.appInteraction": "앱 상호작용",
                    "wallet.copied": "주소가 복사되었습니다",
                    "wallet.sending": "트랜잭션 전송 중...",
                    "wallet.sendSuccess": "트랜잭션 성공!",
                    "wallet.sendFailed": "트랜잭션 실패!",
                    "wallet.assets": "자산",
                    "wallet.closedAccount": "계정이 닫혔습니다",
                    "wallet.amount": "금액",
                    "wallet.sent": "보냄",
                    "wallet.received": "받음",
                    "wallet.unknown": "알 수 없음",
                    "wallet.cancel": "취소",
                    "wallet.transactions": "거래내역",
                    "wallet.viewOnSolscan": "Solscan에서 보기",
                    "wallet.sendErrorMissing": "지갑 또는 토큰 정보가 없습니다",
                    "settings.language": "언어",
                    "settings.theme": "테마 전환",
                    "settings.label": "설정",
                    "swap.label": "스왑",
                    "swap.button": "스왑",
                    "swap.insufficient": "잔액 부족",
                    "swap.balance": "잔액",
                    "swap.max": "최대",
                    "swap.from": "보내는 지갑",
                    "swap.to": "받는 지갑",
                    "token.select": "토큰 선택",
                    "token.search": "토큰 검색...",
                    "token.popular": "인기 토큰",
                    "token.all": "모든 토큰",
                    "token.none": "토큰을 찾을 수 없습니다",
                    "token.loading": "로딩 중...",
                    "token.unknown": "알 수 없는 토큰",
                    "tx.success": "성공",
                    "tx.failed": "실패",
                    "tx.none": "거래 내역이 없습니다",
                    "tx.recipient": "수취인",
                    "tx.recipientPlaceholder": "Solana 주소",
                    "loading.title": "로딩 중...",
                    "loading.more": "더 로딩 중...",
                    "loading.error": "더 로딩하는 중 오류 발생",
                    "loading.noMore": "더 이상 거래가 없습니다",
                    "date.yesterday": "어제",
                    "date.today": "오늘",
                },
            },
            fr: {
                translation: {
                    "wallet.title": "Portefeuille",
                    "wallet.basic": "BASIQUE",
                    "wallet.balance": "Solde",
                    "wallet.pro": "PRO",
                    "wallet.label": "Portefeuille",
                    "wallet.send": "Envoyer",
                    "wallet.receive": "Recevoir",
                    "wallet.close": "Fermer le compte",
                    "wallet.connect": "Connecter le portefeuille",
                    "wallet.appInteraction": "INTERACTION AVEC L'APPLICATION",
                    "wallet.totalbalance": "Solde total",
                    "wallet.copied": "Adresse copiée",
                    "wallet.error_nonzero_balance": "Le solde doit être égal à zéro pour fermer le compte",
                    "wallet.sending": "Envoi de la transaction...",
                    "wallet.sendSuccess": "Transaction réussie !",
                    "wallet.sendFailed": "Échec de la transaction !",
                    "wallet.assets": "Actifs",
                    "wallet.closedAccount": "COMPTE FERMÉ",
                    "wallet.amount": "Montant",
                    "wallet.cancel": "Annuler",
                    "wallet.sent": "ENVOYÉ",
                    "wallet.received": "REÇU",
                    "wallet.unknown": "INCONNU",
                    "wallet.transactions": "Transactions",
                    "wallet.viewOnSolscan": "Voir sur Solscan",
                    "wallet.sendErrorMissing":
                        "Informations manquantes sur le portefeuille ou le token",
                    "settings.language": "Langue",
                    "settings.theme": "Changer le thème",
                    "settings.label": "Paramètres",
                    "swap.label": "Échanger",
                    "swap.button": "Échanger",
                    "swap.balance": "Solde",
                    "swap.max": "Max",
                    "swap.from": "De",
                    "swap.insufficient": "Solde insuffisant",
                    "swap.to": "À",
                    "token.select": "Sélectionner un token",
                    "token.search": "Rechercher un token...",
                    "token.popular": "Tokens populaires",
                    "token.all": "Tous les tokens",
                    "token.none": "Aucun token trouvé",
                    "token.loading": "Chargement...",
                    "token.unknown": "Token inconnu",
                    "tx.success": "Succès",
                    "tx.failed": "Échec",
                    "tx.none": "Aucune transaction trouvée",
                    "tx.recipient": "Destinataire",
                    "tx.recipientPlaceholder": "Adresse Solana",
                    "loading.title": "Chargement...",
                    "loading.more": "Chargement de plus...",
                    "loading.error": "Erreur lors du chargement",
                    "loading.noMore": "Plus de transactions",
                    "date.yesterday": "Hier",
                    "date.today": "Aujourd'hui",
                },
            },
            pt: {
                translation: {
                    "wallet.title": "Carteira",
                    "wallet.basic": "BÁSICO",
                    "wallet.balance": "Saldo",
                    "wallet.pro": "PRO",
                    "wallet.label": "Carteira",
                    "wallet.send": "Enviar",
                    "wallet.receive": "Receber",
                    "wallet.close": "Fechar conta",
                    "wallet.connect": "Conectar carteira",
                    "wallet.totalbalance": "Saldo total",
                    "wallet.appInteraction": "INTERAÇÃO DO APLICATIVO",
                    "wallet.copied": "Endereço copiado",
                    "wallet.sending": "Enviando transação...",
                    "wallet.sendSuccess": "Transação bem-sucedida!",
                    "wallet.sendFailed": "Falha na transação!",
                    "wallet.assets": "Ativos",
                    "wallet.amount": "Quantia",
                    "wallet.closedAccount": "CONTA FECHADA",
                    "wallet.cancel": "Cancelar",
                    "wallet.sent": "ENVIADO",
                    "wallet.received": "RECEBIDO",
                    "wallet.unknown": "DESCONHECIDO",
                    "wallet.transactions": "Transações",
                    "wallet.viewOnSolscan": "Ver no Solscan",
                    "wallet.sendErrorMissing":
                        "Informações da carteira ou token ausentes",
                    "wallet.error_nonzero_balance": "O saldo deve ser zero para fechar a conta",
                    "settings.language": "Idioma",
                    "settings.theme": "Trocar tema",
                    "settings.label": "Configurações",
                    "swap.label": "Trocar",
                    "swap.button": "Trocar",
                    "swap.balance": "Saldo",
                    "swap.max": "Máx",
                    "swap.from": "De",
                    "swap.insufficient": "Saldo insuficiente",
                    "swap.to": "Para",
                    "token.select": "Selecionar token",
                    "token.search": "Pesquisar token...",
                    "token.popular": "Tokens populares",
                    "token.all": "Todos os tokens",
                    "token.none": "Nenhum token encontrado",
                    "token.loading": "Carregando...",
                    "token.unknown": "Token desconhecido",
                    "tx.success": "Sucesso",
                    "tx.failed": "Falha",
                    "tx.none": "Nenhuma transação encontrada",
                    "tx.recipient": "Destinatário",
                    "tx.recipientPlaceholder": "Endereço Solana",
                    "loading.title": "Carregando...",
                    "loading.more": "Carregando mais...",
                    "loading.error": "Erro ao carregar mais",
                    "loading.noMore": "Não há mais transações",
                    "date.yesterday": "Ontem",
                    "date.today": "Hoje",
                },
            },
            tr: {
                translation: {
                    "wallet.title": "Cüzdan",
                    "wallet.basic": "TEMEL",
                    "wallet.balance": "Bakiye",
                    "wallet.pro": "PRO",
                    "wallet.label": "Cüzdan",
                    "wallet.send": "Gönder",
                    "wallet.receive": "Al",
                    "wallet.close": "Hesabı Kapat",
                    "wallet.connect": "Cüzdan Bağla",
                    "wallet.totalbalance": "Toplam Bakiye",
                    "wallet.copied": "Adres kopyalandı",
                    "wallet.appInteraction": "UYGULAMA ETKİLEŞİMİ",
                    "wallet.closedAccount": "HESAP KAPATILDI",
                    "wallet.sending": "İşlem gönderiliyor...",
                    "wallet.sendSuccess": "İşlem başarılı!",
                    "wallet.sendFailed": "İşlem başarısız!",
                    "wallet.assets": "Varlıklar",
                    "wallet.error_nonzero_balance": "Hesabı kapatmak için bakiye sıfır olmalıdır",
                    "wallet.amount": "Miktar",
                    "wallet.sent": "GÖNDERİLDİ",
                    "wallet.received": "ALINDI",
                    "wallet.unknown": "BİLİNMİYOR",
                    "wallet.cancel": "İptal",
                    "wallet.transactions": "İşlemler",
                    "wallet.viewOnSolscan": "Solscan'de görüntüle",
                    "wallet.sendErrorMissing": "Cüzdan veya token bilgisi eksik",
                    "settings.language": "Dil",
                    "settings.theme": "Temayı değiştir",
                    "settings.label": "Ayarlar",
                    "swap.label": "Takas",
                    "swap.button": "Takas",
                    "swap.balance": "Bakiye",
                    "swap.max": "Maks",
                    "swap.insufficient": "Bakiye yetersiz",
                    "swap.from": "Kimden",
                    "swap.to": "Kime",
                    "token.select": "Token seç",
                    "token.search": "Token ara...",
                    "token.popular": "Popüler tokenlar",
                    "token.all": "Tüm tokenlar",
                    "token.none": "Token bulunamadı",
                    "token.loading": "Yükleniyor...",
                    "token.unknown": "Bilinmeyen token",
                    "tx.success": "Başarılı",
                    "tx.failed": "Başarısız",
                    "tx.none": "İşlem bulunamadı",
                    "tx.recipient": "Alıcı",
                    "tx.recipientPlaceholder": "Solana adresi",
                    "loading.title": "Yükleniyor...",
                    "loading.more": "Daha fazla yükleniyor...",
                    "loading.error": "Daha fazla yükleme hatası",
                    "loading.noMore": "Başka işlem yok",
                    "date.yesterday": "Dün",
                    "date.today": "Bugün",
                },
            },
        },
    });
