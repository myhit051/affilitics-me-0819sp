import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RecommendationCard, { RecommendationData } from '../RecommendationCard';

const mockRecommendation: RecommendationData = {
  id: 'test-1',
  type: 'budget',
  title: 'Test Recommendation',
  description: 'This is a test recommendation description',
  impact: 'high',
  confidence: 85,
  expectedROI: 25,
  priority: 3,
  details: ['Detail 1', 'Detail 2'],
  actionItems: ['Action 1', 'Action 2']
};

describe('RecommendationCard', () => {
  it('renders recommendation card with basic information', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);
    
    expect(screen.getByText('Test Recommendation')).toBeInTheDocument();
    expect(screen.getByText('This is a test recommendation description')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('+25%')).toBeInTheDocument();
  });

  it('displays correct type and impact badges', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);
    
    expect(screen.getByText('งบประมาณ')).toBeInTheDocument();
    expect(screen.getByText('สูง')).toBeInTheDocument();
  });

  it('shows priority indicators correctly', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);
    
    // Should show 3 priority dots, all filled for priority 3
    const priorityDots = screen.getAllByRole('generic').filter(el => 
      el.className.includes('rounded-full') && el.className.includes('w-1.5')
    );
    expect(priorityDots).toHaveLength(3);
  });

  it('expands and shows details when expand button is clicked', async () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);
    
    // Initially details should not be visible
    expect(screen.queryByText('รายละเอียด:')).not.toBeInTheDocument();
    
    // Click expand button
    const expandButton = screen.getByRole('button', { name: /chevron/i });
    fireEvent.click(expandButton);
    
    await waitFor(() => {
      expect(screen.getByText('รายละเอียด:')).toBeInTheDocument();
      expect(screen.getByText('Detail 1')).toBeInTheDocument();
      expect(screen.getByText('Detail 2')).toBeInTheDocument();
      expect(screen.getByText('ขั้นตอนการดำเนินการ:')).toBeInTheDocument();
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });
  });

  it('calls onAccept when accept button is clicked', () => {
    const onAccept = vi.fn();
    render(<RecommendationCard recommendation={mockRecommendation} onAccept={onAccept} />);
    
    const acceptButton = screen.getByText('ใช้คำแนะนำ');
    fireEvent.click(acceptButton);
    
    expect(onAccept).toHaveBeenCalledWith('test-1');
  });

  it('calls onReject when reject button is clicked', () => {
    const onReject = vi.fn();
    render(<RecommendationCard recommendation={mockRecommendation} onReject={onReject} />);
    
    const rejectButton = screen.getByText('ไม่สนใจ');
    fireEvent.click(rejectButton);
    
    expect(onReject).toHaveBeenCalledWith('test-1');
  });

  it('handles positive feedback correctly', async () => {
    const onFeedback = vi.fn();
    render(<RecommendationCard recommendation={mockRecommendation} onFeedback={onFeedback} />);
    
    const thumbsUpButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg')?.getAttribute('data-lucide') === 'thumbs-up'
    );
    
    if (thumbsUpButton) {
      fireEvent.click(thumbsUpButton);
      
      expect(onFeedback).toHaveBeenCalledWith('test-1', 'positive');
      
      await waitFor(() => {
        expect(screen.getByText(/ขอบคุณสำหรับ feedback! AI จะเรียนรู้จากการตอบกลับของคุณ/)).toBeInTheDocument();
      });
    }
  });

  it('handles negative feedback correctly', async () => {
    const onFeedback = vi.fn();
    render(<RecommendationCard recommendation={mockRecommendation} onFeedback={onFeedback} />);
    
    const thumbsDownButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg')?.getAttribute('data-lucide') === 'thumbs-down'
    );
    
    if (thumbsDownButton) {
      fireEvent.click(thumbsDownButton);
      
      expect(onFeedback).toHaveBeenCalledWith('test-1', 'negative');
      
      await waitFor(() => {
        expect(screen.getByText(/ขอบคุณสำหรับ feedback! เราจะปรับปรุงคำแนะนำให้ดีขึ้น/)).toBeInTheDocument();
      });
    }
  });

  it('renders in compact mode correctly', () => {
    render(<RecommendationCard recommendation={mockRecommendation} compact={true} />);
    
    expect(screen.getByText('Test Recommendation')).toBeInTheDocument();
    // In compact mode, text should be smaller
    const title = screen.getByText('Test Recommendation');
    expect(title.className).toContain('text-sm');
  });

  it('hides actions when showActions is false', () => {
    render(<RecommendationCard recommendation={mockRecommendation} showActions={false} />);
    
    expect(screen.queryByText('ใช้คำแนะนำ')).not.toBeInTheDocument();
    expect(screen.queryByText('ไม่สนใจ')).not.toBeInTheDocument();
  });

  it('handles different recommendation types correctly', () => {
    const subidRecommendation = { ...mockRecommendation, type: 'subid' as const };
    render(<RecommendationCard recommendation={subidRecommendation} />);
    
    expect(screen.getByText('Sub ID')).toBeInTheDocument();
  });

  it('displays negative ROI correctly', () => {
    const negativeROIRecommendation = { ...mockRecommendation, expectedROI: -15 };
    render(<RecommendationCard recommendation={negativeROIRecommendation} />);
    
    expect(screen.getByText('-15%')).toBeInTheDocument();
    const roiElement = screen.getByText('-15%');
    expect(roiElement.className).toContain('text-red-600');
  });

  it('handles recommendation without details or action items', () => {
    const simpleRecommendation = {
      ...mockRecommendation,
      details: undefined,
      actionItems: undefined
    };
    
    render(<RecommendationCard recommendation={simpleRecommendation} />);
    
    // Expand button should not be present
    expect(screen.queryByRole('button', { name: /chevron/i })).not.toBeInTheDocument();
  });
});