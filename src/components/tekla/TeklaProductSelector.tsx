import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Building, 
  Settings, 
  Globe, 
  ChevronDown, 
  Check,
  Zap,
  Package,
  Database,
  FileText,
  Wrench
} from 'lucide-react';

interface TeklaProduct {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: React.ReactNode;
  isInstalled: boolean;
  isRecommended?: boolean;
}

interface TeklaProductSelectorProps {
  onProductSelect: (product: TeklaProduct) => void;
  onContinue: () => void;
}

export function TeklaProductSelector({ onProductSelect, onContinue }: TeklaProductSelectorProps) {
  const [selectedProduct, setSelectedProduct] = useState<TeklaProduct | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('繁體中文');

  const teklaProducts: TeklaProduct[] = [
    {
      id: 'tekla-structures',
      name: 'Tekla Structures',
      version: '2025',
      description: '完整的結構建模和詳圖軟體',
      icon: <Building className="w-8 h-8" />,
      isInstalled: true,
      isRecommended: true
    },
    {
      id: 'tekla-structural-designer',
      name: 'Tekla Structural Designer',
      version: '2025',
      description: '結構分析和設計軟體',
      icon: <Wrench className="w-8 h-8" />,
      isInstalled: false
    },
    {
      id: 'tekla-powerfab',
      name: 'Tekla PowerFab',
      version: '2025',
      description: '製造管理軟體',
      icon: <Package className="w-8 h-8" />,
      isInstalled: true
    },
    {
      id: 'tekla-tedds',
      name: 'Tekla Tedds',
      version: '2025',
      description: '結構計算和設計軟體',
      icon: <FileText className="w-8 h-8" />,
      isInstalled: false
    },
    {
      id: 'tekla-warehouse',
      name: 'Tekla Warehouse',
      version: '2025',
      description: '模型庫和組件管理',
      icon: <Database className="w-8 h-8" />,
      isInstalled: true
    }
  ];

  const languages = [
    '繁體中文',
    '简体中文', 
    'English',
    '日本語',
    'Deutsch',
    'Français',
    'Español'
  ];

  const handleProductClick = (product: TeklaProduct) => {
    setSelectedProduct(product);
    onProductSelect(product);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="p-8 glass figma-shadow">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <div className="relative">
                <Zap className="w-12 h-12 text-blue-600" />
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  MCP Tekla+
                </h1>
                <p className="text-gray-600">AI 輔助建模平台</p>
              </div>
            </motion.div>
            
            <div className="bg-blue-500 text-white px-6 py-3 rounded-lg inline-block">
              <h2 className="text-xl font-semibold">選擇您的 Tekla 產品和版本</h2>
            </div>
          </div>

          {/* Language Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              語言 / Language
            </label>
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Product Grid */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">產品選擇</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teklaProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedProduct?.id === product.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleProductClick(product)}
                >
                  {/* Recommended Badge */}
                  {product.isRecommended && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      推薦
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {selectedProduct?.id === product.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center">
                    <div className={`mb-3 p-3 rounded-lg ${
                      product.isInstalled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {product.icon}
                    </div>
                    
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {product.name}
                    </h4>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        v{product.version}
                      </span>
                      {product.isInstalled ? (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                          已安裝
                        </span>
                      ) : (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                          未安裝
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Selected Product Info */}
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <h4 className="font-semibold text-blue-800 mb-2">
                已選擇：{selectedProduct.name} {selectedProduct.version}
              </h4>
              <p className="text-blue-700 text-sm">
                {selectedProduct.description}
              </p>
              {!selectedProduct.isInstalled && (
                <p className="text-orange-600 text-sm mt-2">
                  ⚠️ 此產品尚未安裝，某些功能可能無法使用
                </p>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              進階設定
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline">
                取消
              </Button>
              <Button 
                onClick={onContinue}
                disabled={!selectedProduct}
                className="bg-blue-600 hover:bg-blue-700"
              >
                繼續
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              © 2025 MCP Tekla+ - AI 輔助建模平台
            </p>
            <p className="text-xs text-gray-400 mt-1">
              支援 Tekla Structures 2025 及相關產品
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
