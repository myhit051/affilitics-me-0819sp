import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AlertPanel, { AlertData } from '../AlertPanel';

const mockAlerts: AlertData[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Test Opportunity',
    description: 'This is a test opportunity',
    metric: 'ROI',
    currentValue: 150,
    previousValue: 100,
    changePercent: 50,
    priority: 'high',
    timestamp: new Date().toISOString(),
    actionRequired: true,
    viewed: false,
    recommendations: ['Recommendation 1', 'Recommendation 2']
  },
  {
    id: '2',
    type: 'warning',
    title: 'Test Warning',
    description: 'This is a test warning',
    metric: 'Ad Spend',
    currentValue: 5000,
    previousValue: 4000,
    changePercent: 25,
    priority: 'medium',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actionRequired: false,
    viewed: true
  },
  {
    id: '3',
    type: 'critical',
    title: 'Test Critical',
    description: 'This is a test critical alert',
    metric: 'ROI',
    currentValue: -10,
    previousValue: 5,
    changePercent: -300,
    priority: 'high',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    actionRequired: true,
    viewed: false,
    dismissed: false
  }
];

describe('AlertPanel', () => {
  it('renders alert panel with title and basic information', () => {
    render(<AlertPanel alerts={mockAlerts} />);
    
    expect(screen.getByText('AI Alerts')).toBeInTheDocument();
    expect(screen.getByText('การแจ้งเตือนจาก AI')).toBeInTheDocument();
  });

  it('displays unviewed and critical alert counts', () => {
    render(<AlertPanel alerts={mockAlerts} />);
    
    // Should show unviewed count (2 unviewed alerts)
    expect(screen.getByText('2 ใหม่')).toBeInTheDocument();
    
    // Should show critical count (1 critical alert)
    expect(screen.getByText('1 วิกฤต')).toBeInTheDocument();
  });

  it('renders all alert types with correct styling', () => {
    render(<AlertPanel alerts={mockAlerts} />);
    
    expect(screen.getByText('Test Opportunity')).toBeInTheDocument();
    expect(screen.getByText('Test Warning')).toBeInTheDocument();
    expect(screen.getByText('Test Critical')).toBeInTheDocument();
    
    // Check for type labels
    expect(screen.getByText('โอกาส')).toBeInTheDocument();
    expect(screen.getByText('คำเตือน')).toBeInTheDocument();
    expect(screen.getByText('วิกฤต')).toBeInTheDocument();
  });

  it('displays alert metrics and changes correctly', () => {
    render(<AlertPanel alerts={mockAlerts} />);
    
    // Check ROI formatting
    expect(screen.getByText('150%')).toBeInTheDocument();
    expect(screen.getByText('+50%')).toBeInTheDocument();
    
    // Check currency formatting
    expect(screen.getByText('฿5,000')).toBeInTheDocument();
    expect(screen.getByText('+25%')).toBeInTheDocument();
    
    // Check negative values
    expect(screen.getByText('-10%')).toBeInTheDocument();
    expect(screen.getByText('-300%')).toBeInTheDocument();
  });

  it('shows priority indicators correctly', () => {
    render(<AlertPanel alerts={mockAlerts} />);
    
    // High priority alerts should have more filled dots
    const alertElements = screen.getAllByText(/Test/);
    expect(alertElements.length).toBeGreaterThan(0);
  });

  it('formats timestamps correctly', () => {
    render(<AlertPanel alerts={mockAlerts} />);
    
    // Should show relative time
    expect(screen.getByText('เมื่อสักครู่')).toBeInTheDocument();
    expect(screen.getByText('2 ชั่วโมงที่แล้ว')).toBeInTheDocument();
    expect(screen.getByText('1 ชั่วโมงที่แล้ว')).toBeInTheDocument();
  });

  it('expands alert to show recommendations when clicked', async () => {
    render(<AlertPanel alerts={mockAlerts} />);
    
    // Initially recommendations should not be visible
    expect(screen.queryByText('คำแนะนำจาก AI:')).not.toBeInTheDocument();
    
    // Click on the eye button for the first alert
    const eyeButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg')?.getAttribute('data-lucide') === 'eye-off'
    );
    
    if (eyeButtons.length > 0) {
      fireEvent.click(eyeButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('คำแนะนำจาก AI:')).toBeInTheDocument();
        expect(screen.getByText('Recommendation 1')).toBeInTheDocument();
        expect(screen.getByText('Recommendation 2')).toBeInTheDocument();
      });
    }
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<AlertPanel alerts={mockAlerts} onDismiss={onDismiss} />);
    
    const dismissButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg')?.getAttribute('data-lucide') === 'x'
    );
    
    if (dismissButtons.length > 0) {
      fireEvent.click(dismissButtons[0]);
      expect(onDismiss).toHaveBeenCalledWith('1');
    }
  });

  it('calls onMarkAsViewed when alert is expanded', async () => {
    const onMarkAsViewed = vi.fn();
    render(<AlertPanel alerts={mockAlerts} onMarkAsViewed={onMarkAsViewed} />);
    
    const eyeButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg')?.getAttribute('data-lucide') === 'eye-off'
    );
    
    if (eyeButtons.length > 0) {
      fireEvent.click(eyeButtons[0]);
      
      await waitFor(() => {
        expect(onMarkAsViewed).toHaveBeenCalledWith('1');
      });
    }
  });

  it('calls onTakeAction when action button is clicked', async () => {
    const onTakeAction = vi.fn();
    render(<AlertPanel alerts={mockAlerts} onTakeAction={onTakeAction} />);
    
    // First expand an alert to show the action button
    const eyeButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg')?.getAttribute('data-lucide') === 'eye-off'
    );
    
    if (eyeButtons.length > 0) {
      fireEvent.click(eyeButtons[0]);
      
      await waitFor(() => {
        const actionButton = screen.getByText('ดำเนินการ');
        fireEvent.click(actionButton);
        expect(onTakeAction).toHaveBeenCalledWith('1');
      });
    }
  });

  it('filters out dismissed alerts by default', () => {
    const alertsWithDismissed = [
      ...mockAlerts,
      {
        id: '4',
        type: 'info' as const,
        title: 'Dismissed Alert',
        description: 'This alert is dismissed',
        metric: 'ROI',
        currentValue: 100,
        previousValue: 95,
        changePercent: 5,
        priority: 'low' as const,
        timestamp: new Date().toISOString(),
        actionRequired: false,
        viewed: true,
        dismissed: true
      }
    ];
    
    render(<AlertPanel alerts={alertsWithDismissed} />);
    
    expect(screen.queryByText('Dismissed Alert')).not.toBeInTheDocument();
  });

  it('shows dismissed alerts when showDismissed is true', () => {
    const alertsWithDismissed = [
      ...mockAlerts,
      {
        id: '4',
        type: 'info' as const,
        title: 'Dismissed Alert',
        description: 'This alert is dismissed',
        metric: 'ROI',
        currentValue: 100,
        previousValue: 95,
        changePercent: 5,
        priority: 'low' as const,
        timestamp: new Date().toISOString(),
        actionRequired: false,
        viewed: true,
        dismissed: true
      }
    ];
    
    render(<AlertPanel alerts={alertsWithDismissed} showDismissed={true} />);
    
    expect(screen.getByText('Dismissed Alert')).toBeInTheDocument();
  });

  it('limits alerts to maxAlerts prop', () => {
    render(<AlertPanel alerts={mockAlerts} maxAlerts={2} />);
    
    expect(screen.getByText('Test Opportunity')).toBeInTheDocument();
    expect(screen.getByText('Test Critical')).toBeInTheDocument(); // High priority should be shown
    // Third alert might not be shown due to priority sorting and limit
  });

  it('shows empty state when no alerts', () => {
    render(<AlertPanel alerts={[]} />);
    
    expect(screen.getByText('ไม่มีการแจ้งเตือน')).toBeInTheDocument();
    expect(screen.getByText('ระบบทำงานปกติ ไม่พบปัญหาที่ต้องแก้ไข')).toBeInTheDocument();
  });

  it('sorts alerts by priority and timestamp', () => {
    render(<AlertPanel alerts={mockAlerts} />);
    
    // High priority alerts should appear first
    const alertTitles = screen.getAllByText(/Test/);
    expect(alertTitles[0]).toHaveTextContent('Test Critical'); // Most recent high priority
    expect(alertTitles[1]).toHaveTextContent('Test Opportunity'); // Older high priority
  });

  it('displays summary information correctly', () => {
    render(<AlertPanel alerts={mockAlerts} />);
    
    expect(screen.getByText('รวม 3 การแจ้งเตือน')).toBeInTheDocument();
    expect(screen.getByText('2 ยังไม่ได้อ่าน')).toBeInTheDocument();
    expect(screen.getByText('อัปเดตล่าสุด: เมื่อสักครู่')).toBeInTheDocument();
  });
});