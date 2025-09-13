import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SolIcon from '../img/solana.png';

export default function About() {
  const [solanaPrice, setSolanaPrice] = useState({
    usd: 0,
    kzt: 0,
    loading: true,
    error: null
  });

  // Фиксированный курс доллара к тенге
  const USD_TO_KZT_RATE = 540.1;
  
  const fetchSolanaPrice = async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      if (response.data && response.data.solana) {
        const usdPrice = response.data.solana.usd;
        // Рассчитываем курс в тенге на основе фиксированного курса доллара
        const kztPrice = usdPrice * USD_TO_KZT_RATE;
        
        setSolanaPrice({
          usd: usdPrice,
          kzt: kztPrice.toFixed(2),
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error fetching Solana price:', error);
      setSolanaPrice(prev => ({
        ...prev,
        loading: false,
        error: 'Не удалось загрузить цену Solana'
      }));
    }
  };

  useEffect(() => {
    fetchSolanaPrice();
    // Обновление цены каждые 2 минуты
    const interval = setInterval(fetchSolanaPrice, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="sol-text-gradient">О Nomad Market</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Ведущая децентрализованная торговая площадка на блокчейне Solana для цифровых активов.
        </p>
      </div>

      {/* Solana Price Card */}
      <div className="glass-effect p-6 rounded-2xl border border-white/10 shadow-sol-card mb-12 max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <img src={SolIcon} alt="Solana" className="h-8 w-8 mr-3" />
          <h2 className="text-2xl font-bold sol-text-gradient">Solana (SOL)</h2>
        </div>
        
        {solanaPrice.loading ? (
          <div className="py-4 text-center text-gray-400">
            <div className="animate-pulse">Загрузка текущего курса...</div>
          </div>
        ) : solanaPrice.error ? (
          <div className="py-4 text-center text-red-400">{solanaPrice.error}</div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-gray-400">SOL/USD</span>
              <span className="text-xl font-bold">${solanaPrice.usd}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">SOL/KZT</span>
              <span className="text-xl font-bold">{solanaPrice.kzt} ₸</span>
            </div>
            <div className="text-xs text-gray-500 text-right mt-2">
              Обновлено: {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* About Platform Section */}
      <div className="grid md:grid-cols-2 gap-12">
        <div className="glass-effect p-8 rounded-2xl border border-white/10 shadow-sol-card">
          <h2 className="text-3xl font-bold mb-4 sol-text-gradient">Наша платформа</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              <strong>Nomad Market</strong> — инновационная торговая площадка на блокчейне Solana, которая предоставляет своим пользователям возможность покупать и продавать цифровые активы быстро и с минимальными комиссиями.
            </p>
            <p>
              Мы создали платформу, где каждый может стать участником рынка цифровых товаров независимо от того, находится ли он в мире криптовалют уже давно или только делает первые шаги.
            </p>
            <p>
              Наша цель — сделать торговлю цифровыми активами максимально доступной, безопасной и удобной для всех пользователей.
            </p>
          </div>
        </div>

        <div className="glass-effect p-8 rounded-2xl border border-white/10 shadow-sol-card">
          <h2 className="text-3xl font-bold mb-4 sol-text-gradient">Преимущества</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-sol-gradient flex items-center justify-center mr-3 shrink-0">✓</span>
              <span>Мгновенные транзакции благодаря технологии Solana</span>
            </li>
            <li className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-sol-gradient flex items-center justify-center mr-3 shrink-0">✓</span>
              <span>Низкие комиссии за операции на платформе</span>
            </li>
            <li className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-sol-gradient flex items-center justify-center mr-3 shrink-0">✓</span>
              <span>Безопасность транзакций на основе блокчейна</span>
            </li>
            <li className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-sol-gradient flex items-center justify-center mr-3 shrink-0">✓</span>
              <span>Простой и удобный пользовательский интерфейс</span>
            </li>
            <li className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-sol-gradient flex items-center justify-center mr-3 shrink-0">✓</span>
              <span>Поддержка пользователей 24/7</span>
            </li>
          </ul>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="my-12">
        <h2 className="text-4xl font-bold text-center mb-10 sol-text-gradient">Как это работает</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-effect p-6 rounded-2xl border border-white/10 shadow-sol-card text-center">
            <div className="w-16 h-16 rounded-full bg-sol-gradient flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
            <h3 className="text-xl font-semibold mb-3">Создайте аккаунт</h3>
            <p className="text-gray-400">Зарегистрируйтесь на платформе и получите доступ к личному кошельку Solana</p>
          </div>
          <div className="glass-effect p-6 rounded-2xl border border-white/10 shadow-sol-card text-center">
            <div className="w-16 h-16 rounded-full bg-sol-gradient flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
            <h3 className="text-xl font-semibold mb-3">Создайте листинг</h3>
            <p className="text-gray-400">Выставляйте свои цифровые товары на продажу или покупайте у других пользователей</p>
          </div>
          <div className="glass-effect p-6 rounded-2xl border border-white/10 shadow-sol-card text-center">
            <div className="w-16 h-16 rounded-full bg-sol-gradient flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
            <h3 className="text-xl font-semibold mb-3">Торгуйте безопасно</h3>
            <p className="text-gray-400">Совершайте транзакции мгновенно с гарантией безопасности блокчейна Solana</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="glass-effect p-8 rounded-2xl border border-white/10 shadow-sol-card">
        <h2 className="text-3xl font-bold mb-6 sol-text-gradient">Часто задаваемые вопросы</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Что такое Nomad Market?</h3>
            <p className="text-gray-400">Nomad Market — это децентрализованная торговая площадка на блокчейне Solana, где пользователи могут покупать и продавать цифровые товары с использованием криптовалюты SOL.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Как начать пользоваться платформой?</h3>
            <p className="text-gray-400">Просто зарегистрируйтесь, создав аккаунт на нашей платформе. Каждый новый пользователь получает виртуальный кошелек SOL для торговли.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Какие комиссии взимаются при транзакциях?</h3>
            <p className="text-gray-400">Благодаря использованию блокчейна Solana комиссии на нашей платформе минимальны по сравнению с традиционными маркетплейсами и другими блокчейн-платформами.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Безопасно ли пользоваться Nomad Market?</h3>
            <p className="text-gray-400">Да, все транзакции проводятся через блокчейн Solana, что обеспечивает высокий уровень безопасности и прозрачности.</p>
          </div>
        </div>
      </div>
      
      {/* Contact Section */}
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold mb-4 sol-text-gradient">Остались вопросы?</h2>
        <p className="text-gray-300 mb-6">Свяжитесь с нашей командой поддержки</p>
        <a href="mailto:support@nomad-market.com" className="px-6 py-3 bg-sol-gradient hover:shadow-sol-glow rounded-lg font-medium transition-all duration-200 inline-block">
          Написать нам
        </a>
      </div>
    </div>
  );
}
