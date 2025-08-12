/**
 * NEWS CARD - Card componente per singolo articolo news
 *
 * Mostra preview dell'articolo con azioni per modifica, eliminazione
 * e toggle stato pubblicazione/evidenza
 */

import React from "react";
import styled from "styled-components";
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Calendar,
  Tag,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import type { NewsArticle } from "./NewsManager";

interface NewsCardProps {
  article: NewsArticle;
  onEdit: (article: NewsArticle) => void;
  onDelete: (id: number) => void;
  onTogglePublish: (id: number, currentStatus: boolean) => void;
  onToggleFeatured: (id: number, currentStatus: boolean) => void;
}

const Card = styled.div<{ $published: boolean }>`
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  overflow: hidden;
  transition: all 0.2s ease;
  opacity: ${({ $published }) => $published ? 1 : 0.7};

  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: 200px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImagePlaceholder = styled.div`
  color: #ccc;
  text-align: center;
  
  .icon {
    margin-bottom: 0.5rem;
  }
  
  span {
    font-size: 0.9rem;
  }
`;

const StatusBadges = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
`;

const Badge = styled.span<{ $variant: 'published' | 'draft' | 'featured' }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;

  ${({ $variant }) => {
    switch ($variant) {
      case 'published':
        return `
          background: rgba(76, 175, 80, 0.9);
          color: white;
        `;
      case 'draft':
        return `
          background: rgba(255, 193, 7, 0.9);
          color: #333;
        `;
      case 'featured':
        return `
          background: rgba(255, 87, 34, 0.9);
          color: white;
        `;
      default:
        return '';
    }
  }}
`;

const Content = styled.div`
  padding: 1.5rem;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    gap: 0.5rem;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #666;
  font-size: 0.8rem;

  .icon {
    color: #4caf50;
  }
`;

const Category = styled.span`
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const Title = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
  line-height: 1.4;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Subtitle = styled.p`
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #666;
  font-size: 0.8rem;

  .icon {
    color: #4caf50;
  }

  .number {
    font-weight: 600;
    color: #333;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' | 'toggle' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
  min-width: 80px;

  ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: #4caf50;
          color: white;
          &:hover {
            background: #45a049;
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return `
          background: #f44336;
          color: white;
          &:hover {
            background: #da190b;
            transform: translateY(-1px);
          }
        `;
      case 'toggle':
        return `
          background: #f8f9fa;
          color: #666;
          border: 1px solid #e9ecef;
          &:hover {
            background: #e9ecef;
          }
        `;
      default:
        return '';
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleFeatured,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleEdit = () => {
    onEdit(article);
  };

  const handleDelete = () => {
    onDelete(article.id);
  };

  const handleTogglePublish = () => {
    onTogglePublish(article.id, article.is_published);
  };

  const handleToggleFeatured = () => {
    onToggleFeatured(article.id, article.is_featured);
  };

  return (
    <Card $published={article.is_published}>
      <ImageContainer>
        {article.image_url ? (
          <Image src={article.image_url} alt={article.title} />
        ) : (
          <ImagePlaceholder>
            <ImageIcon className="icon" size={32} />
            <div>
              <span>Nessuna immagine</span>
            </div>
          </ImagePlaceholder>
        )}

        <StatusBadges>
          {article.is_published ? (
            <Badge $variant="published">Pubblicato</Badge>
          ) : (
            <Badge $variant="draft">Bozza</Badge>
          )}
          {article.is_featured && (
            <Badge $variant="featured">In evidenza</Badge>
          )}
        </StatusBadges>
      </ImageContainer>

      <Content>
        <Meta>
          <MetaItem>
            <Calendar className="icon" size={14} />
            <span>{formatDate(article.published_date)}</span>
          </MetaItem>
          <Category>{article.category}</Category>
        </Meta>

        <Title>{article.title}</Title>
        
        {article.subtitle && (
          <Subtitle>{article.subtitle}</Subtitle>
        )}

        <Stats>
          <StatItem>
            <TrendingUp className="icon" size={14} />
            <span className="number">{article.views_count}</span>
            <span>views</span>
          </StatItem>
          <StatItem>
            <Calendar className="icon" size={14} />
            <span>Creato {formatDate(article.created_at)}</span>
          </StatItem>
        </Stats>

        <Actions>
          <ActionButton onClick={handleEdit}>
            <Edit size={14} />
            Modifica
          </ActionButton>

          <ActionButton 
            $variant="toggle"
            onClick={handleTogglePublish}
            title={article.is_published ? 'Nascondi articolo' : 'Pubblica articolo'}
          >
            {article.is_published ? (
              <>
                <EyeOff size={14} />
                Nascondi
              </>
            ) : (
              <>
                <Eye size={14} />
                Pubblica
              </>
            )}
          </ActionButton>

          <ActionButton 
            $variant="toggle"
            onClick={handleToggleFeatured}
            title={article.is_featured ? 'Rimuovi evidenza' : 'Metti in evidenza'}
          >
            <Star 
              size={14} 
              fill={article.is_featured ? '#ffc107' : 'transparent'} 
              color={article.is_featured ? '#ffc107' : 'currentColor'}
            />
            {article.is_featured ? 'Evidenza' : 'Evidenza'}
          </ActionButton>

          <ActionButton 
            $variant="danger"
            onClick={handleDelete}
            title="Elimina articolo"
          >
            <Trash2 size={14} />
            Elimina
          </ActionButton>
        </Actions>
      </Content>
    </Card>
  );
};

export default NewsCard;