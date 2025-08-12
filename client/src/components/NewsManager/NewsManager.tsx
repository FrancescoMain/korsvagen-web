/**
 * NEWS MANAGER - Gestione News Dashboard
 *
 * Componente per la gestione completa del sistema news dinamico dalla dashboard admin.
 * Include funzionalità CRUD, upload immagini, gestione categorie e pubblicazione.
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import toast from "react-hot-toast";
import { api } from "../../utils/api";
import {
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Calendar,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  Newspaper,
} from "lucide-react";
import NewsForm from "./NewsForm";
import NewsCard from "./NewsCard";

// Types
export interface NewsArticle {
  id: number;
  title: string;
  subtitle?: string;
  slug: string;
  category: string;
  content: string;
  image_url?: string;
  image_public_id?: string;
  published_date: string;
  is_published: boolean;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

type SortOption = 'newest' | 'oldest' | 'title' | 'views';
type FilterOption = 'all' | 'published' | 'draft' | 'featured';

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
  font-size: 1rem;
`;

const Stats = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #666;

  .icon {
    color: #4caf50;
  }

  .number {
    font-weight: 600;
    color: #333;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
  }
`;

const Button = styled.button<{
  $variant?: 'primary' | 'secondary';
}>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  ${({ $variant = 'primary' }) => $variant === 'primary' ? `
    background: #4caf50;
    color: white;
    &:hover {
      background: #45a049;
      transform: translateY(-1px);
    }
  ` : `
    background: #f8f9fa;
    color: #666;
    border: 1px solid #e9ecef;
    &:hover {
      background: #e9ecef;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    font-size: 0.9rem;
    background: white;

    &:focus {
      outline: none;
      border-color: #4caf50;
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
    }
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
`;

const CategorySelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
`;

const SortSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;

  .icon {
    margin-bottom: 1rem;
    color: #ccc;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  color: #666;
  font-size: 0.9rem;
`;

const NewsManager: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Statistics
  const totalArticles = articles.length;
  const publishedArticles = articles.filter(a => a.is_published).length;
  const draftArticles = articles.filter(a => !a.is_published).length;
  const featuredArticles = articles.filter(a => a.is_featured).length;
  const totalViews = articles.reduce((sum, a) => sum + a.views_count, 0);

  // Load articles
  const loadArticles = async () => {
    try {
      setLoading(true);
      
      const response = await api.news.getAdminList();
      
      setArticles(response.data.data || []);

      // Extract unique categories
      const allCategories = response.data.data?.map((a: NewsArticle) => a.category) || [];
      const uniqueCategories = Array.from(new Set(allCategories)) as string[];
      setCategories(uniqueCategories);

    } catch (error: any) {
      console.error('Errore caricamento articoli:', error);
      toast.error(error.message || 'Errore nel caricamento degli articoli');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort articles
  const filteredAndSortedArticles = React.useMemo(() => {
    let filtered = articles;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(term) ||
        article.subtitle?.toLowerCase().includes(term) ||
        article.category.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by publication status
    if (filterOption === 'published') {
      filtered = filtered.filter(article => article.is_published);
    } else if (filterOption === 'draft') {
      filtered = filtered.filter(article => !article.is_published);
    } else if (filterOption === 'featured') {
      filtered = filtered.filter(article => article.is_featured);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'views':
          return b.views_count - a.views_count;
        default:
          return 0;
      }
    });

    return filtered;
  }, [articles, searchTerm, selectedCategory, filterOption, sortOption]);

  // Event handlers
  const handleCreateNew = () => {
    setEditingArticle(null);
    setShowForm(true);
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingArticle(null);
  };

  const handleSaveSuccess = () => {
    setShowForm(false);
    setEditingArticle(null);
    loadArticles();
    toast.success('Articolo salvato con successo');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo articolo?')) {
      return;
    }

    try {
      await api.news.delete(id);
      setArticles(prev => prev.filter(a => a.id !== id));
      toast.success('Articolo eliminato con successo');
    } catch (error: any) {
      console.error('Errore eliminazione:', error);
      toast.error(error.message || 'Errore nell\'eliminazione dell\'articolo');
    }
  };

  const handleTogglePublish = async (id: number, currentStatus: boolean) => {
    try {
      const response = await api.news.update(id, {
        is_published: !currentStatus
      });

      setArticles(prev => prev.map(a => a.id === id ? response.data.data : a));
      toast.success(`Articolo ${!currentStatus ? 'pubblicato' : 'rimosso dalla pubblicazione'}`);
    } catch (error: any) {
      console.error('Errore toggle publish:', error);
      toast.error(error.message || 'Errore nell\'aggiornamento dello stato');
    }
  };

  const handleToggleFeatured = async (id: number, currentStatus: boolean) => {
    try {
      const response = await api.news.update(id, {
        is_featured: !currentStatus
      });

      setArticles(prev => prev.map(a => a.id === id ? response.data.data : a));
      toast.success(`Articolo ${!currentStatus ? 'messo in evidenza' : 'rimosso dalla evidenza'}`);
    } catch (error: any) {
      console.error('Errore toggle featured:', error);
      toast.error(error.message || 'Errore nell\'aggiornamento dello stato');
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  if (showForm) {
    return (
      <NewsForm
        article={editingArticle}
        onClose={handleCloseForm}
        onSuccess={handleSaveSuccess}
        categories={categories}
      />
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>
            <Newspaper size={28} />
            Gestione News
          </Title>
          <Subtitle>
            Gestisci articoli, blog e news del sito web
          </Subtitle>
          <Stats>
            <StatItem>
              <FileText className="icon" size={16} />
              <span className="number">{totalArticles}</span>
              <span>Totali</span>
            </StatItem>
            <StatItem>
              <Eye className="icon" size={16} />
              <span className="number">{publishedArticles}</span>
              <span>Pubblicati</span>
            </StatItem>
            <StatItem>
              <EyeOff className="icon" size={16} />
              <span className="number">{draftArticles}</span>
              <span>Bozze</span>
            </StatItem>
            <StatItem>
              <TrendingUp className="icon" size={16} />
              <span className="number">{totalViews.toLocaleString()}</span>
              <span>Visualizzazioni</span>
            </StatItem>
          </Stats>
        </HeaderLeft>

        <HeaderActions>
          <Button onClick={handleCreateNew}>
            <Plus size={18} />
            Nuovo Articolo
          </Button>
        </HeaderActions>
      </Header>

      <Controls>
        <SearchBox>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Cerca articoli..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <CategorySelect
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Tutte le categorie</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </CategorySelect>

        <FilterSelect
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value as FilterOption)}
        >
          <option value="all">Tutti gli articoli</option>
          <option value="published">Pubblicati</option>
          <option value="draft">Bozze</option>
          <option value="featured">In evidenza</option>
        </FilterSelect>

        <SortSelect
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
        >
          <option value="newest">Più recenti</option>
          <option value="oldest">Più vecchi</option>
          <option value="title">Titolo A-Z</option>
          <option value="views">Più visualizzati</option>
        </SortSelect>
      </Controls>

      {loading ? (
        <Loading>Caricamento articoli...</Loading>
      ) : filteredAndSortedArticles.length === 0 ? (
        <EmptyState>
          <Newspaper className="icon" size={64} />
          <h3>Nessun articolo trovato</h3>
          <p>
            {searchTerm || selectedCategory !== 'all' || filterOption !== 'all'
              ? 'Prova a modificare i filtri di ricerca'
              : 'Inizia creando il primo articolo'}
          </p>
        </EmptyState>
      ) : (
        <NewsGrid>
          {filteredAndSortedArticles.map(article => (
            <NewsCard
              key={article.id}
              article={article}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
        </NewsGrid>
      )}
    </Container>
  );
};

export default NewsManager;