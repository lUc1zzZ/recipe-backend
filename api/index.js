const express = require('express');
const cors = require('cors');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 存储数据（生产环境请用数据库）
let recipes = [];
let userData = {};

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Recipe Backend is running',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
});

// 同步食谱数据
app.post('/api/recipes/sync', (req, res) => {
  console.log('Received recipe sync:', req.body);
  
  const { deviceId, recipes: deviceRecipes, timestamp } = req.body;
  
  if (deviceRecipes && Array.isArray(deviceRecipes)) {
    // 简单的合并逻辑
    recipes = [...recipes, ...deviceRecipes];
    // 去重
    recipes = recipes.filter((recipe, index, self) => 
      index === self.findIndex(r => r.id === recipe.id)
    );
  }
  
  res.json({ 
    success: true, 
    message: 'Recipes synced successfully',
    syncedCount: deviceRecipes ? deviceRecipes.length : 0,
    totalRecipes: recipes.length
  });
});

// 获取食谱列表
app.get('/api/recipes', (req, res) => {
  res.json({
    success: true,
    recipes: recipes
  });
});

// 用户数据同步
app.post('/api/user/sync', (req, res) => {
  const { deviceId, favorites, settings } = req.body;
  
  if (!userData[deviceId]) {
    userData[deviceId] = { favorites: [], settings: {} };
  }
  
  if (favorites) userData[deviceId].favorites = favorites;
  if (settings) userData[deviceId].settings = settings;
  
  res.json({
    success: true,
    message: 'User data synced successfully'
  });
});

// 获取用户数据
app.get('/api/user/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const data = userData[deviceId] || { favorites: [], settings: {} };
  
  res.json({
    success: true,
    data: data
  });
});

// TTS 代理端点
app.post('/api/tts', (req, res) => {
  const { text, voice = "xiaoyan" } = req.body;
  
  console.log('TTS request:', { text, voice });
  
  // 这里后续集成讯飞 TTS API
  res.json({
    success: true,
    message: 'TTS request received (to be implemented)',
    text: text
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Node.js ${process.version}`);
});

module.exports = app;