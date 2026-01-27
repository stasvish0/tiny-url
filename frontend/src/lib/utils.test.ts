import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (className utility)', () => {
  describe('basic functionality', () => {
    it('should return empty string for no arguments', () => {
      expect(cn()).toBe('');
    });

    it('should return single class unchanged', () => {
      expect(cn('foo')).toBe('foo');
    });

    it('should merge multiple classes', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle undefined values', () => {
      expect(cn('foo', undefined, 'bar')).toBe('foo bar');
    });

    it('should handle null values', () => {
      expect(cn('foo', null, 'bar')).toBe('foo bar');
    });

    it('should handle false values', () => {
      expect(cn('foo', false, 'bar')).toBe('foo bar');
    });
  });

  describe('conditional classes', () => {
    it('should include class when condition is true', () => {
      const isActive = true;
      expect(cn('base', isActive && 'active')).toBe('base active');
    });

    it('should exclude class when condition is false', () => {
      const isActive = false;
      expect(cn('base', isActive && 'active')).toBe('base');
    });

    it('should handle object syntax for conditionals', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });
  });

  describe('tailwind merge behavior', () => {
    it('should merge conflicting padding classes (last wins)', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });

    it('should merge conflicting margin classes', () => {
      expect(cn('m-4', 'm-8')).toBe('m-8');
    });

    it('should merge conflicting text color classes', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('should merge conflicting background classes', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });

    it('should keep non-conflicting classes', () => {
      expect(cn('p-4', 'm-4', 'text-red-500')).toBe('p-4 m-4 text-red-500');
    });

    it('should handle complex tailwind class merging', () => {
      expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6');
    });
  });

  describe('array inputs', () => {
    it('should handle array of classes', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar');
    });

    it('should handle nested arrays', () => {
      expect(cn(['foo', ['bar', 'baz']])).toBe('foo bar baz');
    });
  });

  describe('real-world usage patterns', () => {
    it('should handle button variant pattern', () => {
      const variant = 'primary';
      const size = 'lg';
      const result = cn(
        'inline-flex items-center justify-center',
        variant === 'primary' && 'bg-primary text-primary-foreground',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground',
        size === 'sm' && 'h-8 px-3',
        size === 'lg' && 'h-10 px-8'
      );
      expect(result).toBe('inline-flex items-center justify-center bg-primary text-primary-foreground h-10 px-8');
    });

    it('should handle className override pattern', () => {
      const baseClasses = 'p-4 bg-white rounded';
      const userClasses = 'p-6 bg-gray-100';
      expect(cn(baseClasses, userClasses)).toBe('rounded p-6 bg-gray-100');
    });
  });
});
