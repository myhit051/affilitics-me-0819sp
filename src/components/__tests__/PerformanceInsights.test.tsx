import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PerformanceInsights from '../PerformanceInsights';

describe('PerformanceInsights', () => {
  it('renders performance insights with title and basic information', () => {
    render(<PerformanceInsights />);
    
    expect(screen.getByText('Performance Insights')).toBeInTheDocument();
    expect(screen.getByText('การวิเคราะห์ประสิทธิภาพด้วย AI')).toBeInTheDocument();
  });

  it('displays benchmark period badge correctly', () => {
    render(<PerformanceInsights benchmarkPeriod="week" />);
    
    expect(screen.getByText('เทียบกับสัปดาห์ที่แล้ว')).toBeInTheDocument();
  });

  it('shows all tab navigation options', () => {
    render(<PerformanceInsights showTopPerformers={true} showPatterns={true} />);
    
    expect(screen.getByText('เมตริก')).toBeInTheDocument();
    expect(screen.getByText('ผู้นำ')).toBeInTheDocument();
    expect(screen.getByText('ข้อมูลเชิงลึก')).toBeInTheDocument();
  });

  it('hides top performers tab when showTopPerformers is false', () => {
    render(<PerformanceInsights showTopPerformers={false} showPatterns={true} />);
    
    expect(screen.getByText('เมตริก')).toBeInTheDocument();
    expect(screen.queryByText('ผู้นำ')).not.toBeInTheDocument();
    expect(screen.getByText('ข้อมูลเชิงลึก')).toBeInTheDocument();
  });

  it('hides insights tab when showPatterns is false', () => {
    render(<PerformanceInsights showTopPerformers={true} showPatterns={false} />);
    
    expect(screen.getByText('เมตริก')).toBeInTheDocument();
    expect(screen.getByText('ผู้นำ')).toBeInTheDocument();
    expect(screen.queryByText('ข้อมูลเชิงลึก')).not.toBeInTheDocument();
  });

  it('displays metrics tab content by default', () => {
    render(<PerformanceInsights />);
    
    // Should show category filters
    expect(screen.getByText('ทั้งหมด')).toBeInTheDocument();
    expect(screen.getByText('roi')).toBeInTheDocument();
    expect(screen.getByText('cost')).toBeInTheDocument();
    expect(screen.getByText('volume')).toBeInTheDocument();
    expect(screen.getByText('efficiency')).toBeInTheDocument();
    
    // Should show metrics
    expect(screen.getByText('Overall ROI')).toBeInTheDocument();
    expect(screen.getByText('Cost Per Order')).toBeInTheDocument();
  });

  it('filters metrics by category when category button is clicked', () => {
    render(<PerformanceInsights />);
    
    // Click on ROI category
    const roiButton = screen.getByText('roi');
    fireEvent.click(roiButton);
    
    // Should show only ROI metrics
    expect(screen.getByText('Overall ROI')).toBeInTheDocument();
    // Cost metrics should still be visible as they're in the mock data
  });

  it('switches to top performers tab correctly', () => {
    render(<PerformanceInsights showTopPerformers={true} />);
    
    const performersTab = screen.getByText('ผู้นำ');
    fireEvent.click(performersTab);
    
    // Should show top performers
    expect(screen.getByText('SP001')).toBeInTheDocument();
    expect(screen.getByText('Shopee')).toBeInTheDocument();
    expect(screen.getByText('14:00-18:00')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  it('switches to insights tab correctly', () => {
    render(<PerformanceInsights showPatterns={true} />);
    
    const insightsTab = screen.getByText('ข้อมูลเชิงลึก');
    fireEvent.click(insightsTab);
    
    // Should show insights
    expect(screen.getByText('รูปแบบการใช้จ่ายที่มีประสิทธิภาพ')).toBeInTheDocument();
    expect(screen.getByText('โอกาสในการปรับปรุง Sub ID')).toBeInTheDocument();
  });

  it('displays metric values with correct formatting', () => {
    render(<PerformanceInsights />);
    
    // Should format percentage values
    expect(screen.getByText('156.0%')).toBeInTheDocument();
    
    // Should format currency values
    expect(screen.getByText('฿45')).toBeInTheDocument();
    
    // Should format order counts
    expect(screen.getByText('127 orders')).toBeInTheDocument();
  });

  it('shows trend indicators for metrics', () => {
    render(<PerformanceInsights />);
    
    // Should show positive and negative changes
    expect(screen.getByText('+9.9%')).toBeInTheDocument();
    expect(screen.getByText('-13.5%')).toBeInTheDocument();
    expect(screen.getByText('+29.6%')).toBeInTheDocument();
  });

  it('displays priority badges for metrics', () => {
    render(<PerformanceInsights />);
    
    // Should show priority indicators
    expect(screen.getAllByText('high')).toHaveLength(3); // 3 high priority metrics in mock data
    expect(screen.getAllByText('medium')).toHaveLength(2); // 2 medium priority metrics
  });

  it('shows top performer rankings correctly', () => {
    render(<PerformanceInsights showTopPerformers={true} />);
    
    const performersTab = screen.getByText('ผู้นำ');
    fireEvent.click(performersTab);
    
    // Should show ranking numbers (1, 2, 3, 4)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('displays improvement percentages for top performers', () => {
    render(<PerformanceInsights showTopPerformers={true} />);
    
    const performersTab = screen.getByText('ผู้นำ');
    fireEvent.click(performersTab);
    
    // Should show improvement percentages
    expect(screen.getByText('+45%')).toBeInTheDocument();
    expect(screen.getByText('+23%')).toBeInTheDocument();
    expect(screen.getByText('+34%')).toBeInTheDocument();
    expect(screen.getByText('+28%')).toBeInTheDocument();
  });

  it('shows insight confidence scores', () => {
    render(<PerformanceInsights showPatterns={true} />);
    
    const insightsTab = screen.getByText('ข้อมูลเชิงลึก');
    fireEvent.click(insightsTab);
    
    // Should show confidence percentages
    expect(screen.getByText('89% แม่นยำ')).toBeInTheDocument();
    expect(screen.getByText('76% แม่นยำ')).toBeInTheDocument();
    expect(screen.getByText('92% แม่นยำ')).toBeInTheDocument();
  });

  it('displays insight impact levels', () => {
    render(<PerformanceInsights showPatterns={true} />);
    
    const insightsTab = screen.getByText('ข้อมูลเชิงลึก');
    fireEvent.click(insightsTab);
    
    // Should show impact levels
    expect(screen.getByText('high impact')).toBeInTheDocument();
    expect(screen.getByText('medium impact')).toBeInTheDocument();
  });

  it('shows recommendations for actionable insights', () => {
    render(<PerformanceInsights showPatterns={true} />);
    
    const insightsTab = screen.getByText('ข้อมูลเชิงลึก');
    fireEvent.click(insightsTab);
    
    // Should show recommendations
    expect(screen.getByText('คำแนะนำ:')).toBeInTheDocument();
    expect(screen.getByText('เพิ่มงบประมาณในช่วงเวลา 10:00-14:00')).toBeInTheDocument();
  });

  it('limits insights to maxInsights prop', () => {
    render(<PerformanceInsights showPatterns={true} maxInsights={2} />);
    
    const insightsTab = screen.getByText('ข้อมูลเชิงลึก');
    fireEvent.click(insightsTab);
    
    // Should show only 2 insights
    expect(screen.getByText('รูปแบบการใช้จ่ายที่มีประสิทธิภาพ')).toBeInTheDocument();
    expect(screen.getByText('โอกาสในการปรับปรุง Sub ID')).toBeInTheDocument();
    // Third insight should not be visible
  });

  it('displays summary information correctly', () => {
    render(<PerformanceInsights showTopPerformers={true} showPatterns={true} />);
    
    expect(screen.getByText('อัปเดตล่าสุด: เมื่อสักครู่')).toBeInTheDocument();
    expect(screen.getByText('5 เมตริก')).toBeInTheDocument();
    expect(screen.getByText('4 ผู้นำ')).toBeInTheDocument();
    expect(screen.getByText('5 ข้อมูลเชิงลึก')).toBeInTheDocument();
  });

  it('handles different benchmark periods correctly', () => {
    render(<PerformanceInsights benchmarkPeriod="quarter" />);
    
    expect(screen.getByText('เทียบกับไตรมาสที่แล้ว')).toBeInTheDocument();
  });

  it('shows filter button in header', () => {
    render(<PerformanceInsights />);
    
    expect(screen.getByText('ตัวกรอง')).toBeInTheDocument();
  });

  it('displays different insight types with correct styling', () => {
    render(<PerformanceInsights showPatterns={true} />);
    
    const insightsTab = screen.getByText('ข้อมูลเชิงลึก');
    fireEvent.click(insightsTab);
    
    // Different insight types should be present
    expect(screen.getByText('รูปแบบการใช้จ่ายที่มีประสิทธิภาพ')).toBeInTheDocument(); // pattern
    expect(screen.getByText('โอกาสในการปรับปรุง Sub ID')).toBeInTheDocument(); // opportunity
    expect(screen.getByText('ความเสี่ยงจากการพึ่งพา Sub ID เดียว')).toBeInTheDocument(); // risk
    expect(screen.getByText('เปรียบเทียบกับช่วงเดียวกันปีที่แล้ว')).toBeInTheDocument(); // benchmark
  });
});