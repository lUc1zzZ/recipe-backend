const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 存储数据（生产环境请用数据库）
let recipes = [];
let userData = {};

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Recipe Backend is running' });
});

// 同步食谱数据
app.post('/api/recipes/sync', (req, res) => {
  console.log('Received recipe sync:', req.body);
  
  const { deviceId, recipes: deviceRecipes, timestamp } = req.body;
  
  if (deviceRecipes) {
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
    userData[deviceId] = {};
  }
  
  if (favorites) userData[deviceId].favorites = favorites;
  if (settings) userData[deviceId].settings = settings;
  
  res.json({
    success: true,
    message: 'User data synced'
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});