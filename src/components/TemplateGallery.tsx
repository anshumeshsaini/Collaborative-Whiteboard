import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, Search, Star, Download, X, 
  Grid3X3, Lightbulb, Clock, Users, 
  Heart, TrendingUp, Zap, Bookmark
} from 'lucide-react';
import { useWhiteboard } from '../contexts/WhiteboardContext';
import { templateService } from '../services/templateService';
import { Template, TemplateCategory } from '../types';

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ isOpen, onClose }) => {
  const { loadTemplate, state } = useWhiteboard();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all' | 'suggested'>('suggested');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = useMemo(() => [
    { id: 'suggested', label: 'Suggested', icon: <Zap className="w-4 h-4" /> },
    { id: 'all', label: 'All Templates', icon: <Grid3X3 className="w-4 h-4" /> },
    { id: 'brainstorming', label: 'Brainstorming', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'flowchart', label: 'Flowcharts', icon: <Layout className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timelines', icon: <Clock className="w-4 h-4" /> },
    { id: 'wireframe', label: 'Wireframes', icon: <Grid3X3 className="w-4 h-4" /> },
    { id: 'uml', label: 'UML Diagrams', icon: <Layout className="w-4 h-4" /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="w-4 h-4" /> }
  ], []);

  // Get suggested templates and all templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const allTemplates = await templateService.getTemplates();
        setTemplates(allTemplates);
        
        // Load favorites from local storage
        const savedFavorites = localStorage.getItem('templateFavorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Get suggested templates based on current drawing
  const suggestedTemplates = useMemo(() => {
    return templateService.suggestTemplates(state.strokes);
  }, [state.strokes]);

  // Filter templates based on selected category and search query
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'suggested') return suggestedTemplates;
    if (selectedCategory === 'favorites') {
      return templates.filter(template => favorites.includes(template.id));
    }

    let filtered = [...templates];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = templateService.searchTemplates(searchQuery, filtered);
    }

    return filtered;
  }, [templates, selectedCategory, searchQuery, suggestedTemplates, favorites]);

  const handleLoadTemplate = (templateId: string) => {
    loadTemplate(templateId);
    onClose();
  };

  const toggleFavorite = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(templateId)
      ? favorites.filter(id => id !== templateId)
      : [...favorites, templateId];
    
    setFavorites(newFavorites);
    localStorage.setItem('templateFavorites', JSON.stringify(newFavorites));
  };

  const getCategoryColor = (category: TemplateCategory) => {
    const colors = {
      brainstorming: 'bg-yellow-100 text-yellow-800',
      flowchart: 'bg-blue-100 text-blue-800',
      timeline: 'bg-green-100 text-green-800',
      wireframe: 'bg-purple-100 text-purple-800',
      uml: 'bg-indigo-100 text-indigo-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.custom;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Bookmark className="w-6 h-6 text-blue-500 mr-2" />
                  Template Gallery
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search and Categories */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex-shrink-0">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all' | 'suggested')}
                    className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {/* Category Header */}
                  <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      {categories.find(c => c.id === selectedCategory)?.icon}
                      <span className="ml-2">
                        {categories.find(c => c.id === selectedCategory)?.label}
                      </span>
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({filteredTemplates.length} templates)
                      </span>
                    </h3>
                  </div>

                  {/* Templates Grid */}
                  {filteredTemplates.length === 0 ? (
                    <div className="text-center py-12">
                      <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No templates found</p>
                      {selectedCategory === 'favorites' && (
                        <p className="text-sm text-gray-400 mt-2">
                          Save templates as favorites to see them here
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                      {filteredTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onLoad={handleLoadTemplate}
                          onFavorite={toggleFavorite}
                          isFavorite={favorites.includes(template.id)}
                          isHighlighted={selectedCategory === 'suggested'}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>Popular: Flowcharts, Wireframes</span>
                  </div>
                </div>
                <div>
                  <span>Need help? Browse our template guide</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface TemplateCardProps {
  template: Template;
  onLoad: (templateId: string) => void;
  onFavorite: (templateId: string, e: React.MouseEvent) => void;
  isFavorite: boolean;
  isHighlighted?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  onLoad, 
  onFavorite,
  isFavorite,
  isHighlighted 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryColor = (category: TemplateCategory) => {
    const colors = {
      brainstorming: 'bg-yellow-100 text-yellow-800',
      flowchart: 'bg-blue-100 text-blue-800',
      timeline: 'bg-green-100 text-green-800',
      wireframe: 'bg-purple-100 text-purple-800',
      uml: 'bg-indigo-100 text-indigo-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.custom;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`relative bg-white rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 shadow-sm ${
        isHighlighted 
          ? 'border-yellow-300 shadow-md ring-1 ring-yellow-200' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
      }`}
      onClick={() => onLoad(template.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Favorite Button */}
      <motion.button
        className={`absolute top-2 right-2 z-10 p-2 rounded-full backdrop-blur-sm ${
          isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
        }`}
        onClick={(e) => onFavorite(template.id, e)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart 
          className="w-5 h-5" 
          fill={isFavorite ? "currentColor" : "none"} 
        />
      </motion.button>

      {/* Thumbnail */}
      <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
        {template.thumbnail ? (
          <img 
            src={template.thumbnail} 
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Layout className="w-12 h-12 text-gray-400" />
        )}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-white text-blue-600 px-4 py-2 rounded-full font-medium text-sm shadow-md"
            >
              Use Template
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
            {template.name}
          </h4>
          {isHighlighted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-yellow-100 text-yellow-800 p-1 rounded-full"
            >
              <Zap className="w-3 h-3" />
            </motion.div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
            {template.category}
          </span>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            <span>{template.usage.toLocaleString()}+</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TemplateGallery;