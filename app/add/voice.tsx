import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Easing,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/Theme';

// Mock AI speech recognition results
const mockRecognitionResult = {
  text: "Coffee at Starbucks for $4.50 yesterday",
  parsedData: {
    amount: 4.50,
    category: "food",
    date: new Date(Date.now() - 86400000), // yesterday
    merchant: "Starbucks",
    item: "Coffee"
  },
  confidence: 0.92
};

export default function VoiceExpenseScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [processingStage, setProcessingStage] = useState<'idle' | 'recording' | 'processing' | 'results'>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recognitionResult, setRecognitionResult] = useState<null | typeof mockRecognitionResult>(null);
  const [editedValues, setEditedValues] = useState<any>(null);
  
  // Animation values
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const processingAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isRecording) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Simulate recording duration
      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      
      return () => {
        clearInterval(interval);
        pulseAnim.setValue(1);
      };
    }
  }, [isRecording, pulseAnim]);
  
  useEffect(() => {
    if (processingStage === 'processing') {
      // Start processing animation
      Animated.loop(
        Animated.timing(processingAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      
      // Simulate AI processing
      const timeout = setTimeout(() => {
        processingAnim.stopAnimation();
        setProcessingStage('results');
        setRecognitionResult(mockRecognitionResult);
        setEditedValues(mockRecognitionResult.parsedData);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 2000);
      
      return () => {
        clearTimeout(timeout);
        processingAnim.setValue(0);
      };
    }
  }, [processingStage, processingAnim]);
  
  const handleStartRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);
    setProcessingStage('recording');
  };
  
  const handleStopRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(false);
    setProcessingStage('processing');
  };

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Here you would save the expense with the editedValues
    console.log('Saving expense:', editedValues);
    router.back();
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const renderIdleState = () => (
    <View style={styles.centeredContainer}>
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionTitle}>Voice Expense</Text>
        <Text style={styles.instructionText}>
          Tap the microphone and say your expense details.
        </Text>
        <Text style={styles.exampleText}>
          Try saying something like:
        </Text>
        <View style={styles.exampleBubble}>
          <Text style={styles.exampleBubbleText}>
            "Spent $12.50 on lunch at Chipotle yesterday"
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.recordButton}
        onPress={handleStartRecording}
        activeOpacity={0.8}
      >
        <Ionicons name="mic" size={32} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.tipContainer}>
        <Ionicons name="bulb-outline" size={16} color={Colors.primary} />
        <Text style={styles.tipText}>
          Our AI will detect the amount, category, date, and merchant automatically.
        </Text>
      </View>
    </View>
  );
  
  const renderRecordingState = () => (
    <View style={styles.centeredContainer}>
      <Text style={styles.recordingText}>Listening...</Text>
      <Text style={styles.timerText}>{formatTime(recordingDuration)}</Text>
      
      <Animated.View
        style={[
          styles.pulsingCircle,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      
      <TouchableOpacity
        style={[styles.recordButton, styles.recordingButton]}
        onPress={handleStopRecording}
        activeOpacity={0.8}
      >
        <View style={styles.stopButton} />
      </TouchableOpacity>
      
      <Text style={styles.tapToStopText}>Tap to stop</Text>
    </View>
  );
  
  const renderProcessingState = () => (
    <View style={styles.centeredContainer}>
      <Text style={styles.processingTitle}>Processing</Text>
      <Text style={styles.processingText}>Our AI is analyzing your expense...</Text>
      
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.processingBar,
            {
              transform: [
                {
                  translateX: processingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-150, 150],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
  
  const renderResultsState = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        style={styles.resultsContainer}
        contentContainerStyle={styles.resultsContent}
      >
        <View style={styles.recognizedTextContainer}>
          <Text style={styles.recognizedLabel}>I heard:</Text>
          <Text style={styles.recognizedText}>"{recognitionResult?.text}"</Text>
          <View style={styles.confidenceContainer}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.confidenceText}>
              {Math.round((recognitionResult?.confidence || 0) * 100)}% confidence
            </Text>
          </View>
        </View>
        
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Expense Details</Text>
          <Text style={styles.detailsSubtitle}>Please review and edit if needed</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={editedValues?.amount.toString()}
                onChangeText={(text) => 
                  setEditedValues({ ...editedValues, amount: parseFloat(text) || 0 })
                }
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categorySelector}>
              {['food', 'transport', 'shopping', 'entertainment'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    editedValues?.category === cat && styles.categoryOptionSelected,
                  ]}
                  onPress={() => setEditedValues({ ...editedValues, category: cat })}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      editedValues?.category === cat && styles.categoryTextSelected,
                    ]}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Merchant</Text>
            <TextInput
              style={styles.textInput}
              value={editedValues?.merchant}
              onChangeText={(text) => 
                setEditedValues({ ...editedValues, merchant: text })
              }
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date</Text>
            <TextInput
              style={styles.textInput}
              value={editedValues?.date.toLocaleDateString()}
              editable={false}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Note</Text>
            <TextInput
              style={styles.textInput}
              value={editedValues?.item}
              onChangeText={(text) => 
                setEditedValues({ ...editedValues, item: text })
              }
              placeholder="Add a note"
            />
          </View>
        </View>
      </ScrollView>
      
      <BlurView intensity={90} style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Save Expense</Text>
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Voice Expense',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.background },
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel} style={{ padding: 8 }}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      {processingStage === 'idle' && renderIdleState()}
      {processingStage === 'recording' && renderRecordingState()}
      {processingStage === 'processing' && renderProcessingState()}
      {processingStage === 'results' && renderResultsState()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  instructionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.m,
  },
  instructionText: {
    fontSize: FontSize.m,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.l,
  },
  exampleText: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    marginBottom: Spacing.s,
  },
  exampleBubble: {
    backgroundColor: Colors.primary + '20',
    borderRadius: BorderRadius.l,
    padding: Spacing.m,
    maxWidth: '100%',
  },
  exampleBubbleText: {
    fontSize: FontSize.m,
    color: Colors.primary,
    fontWeight: '500',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.medium,
  },
  recordingButton: {
    backgroundColor: Colors.danger,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    marginTop: Spacing.xxl,
    maxWidth: 300,
  },
  tipText: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    marginLeft: Spacing.s,
    flex: 1,
  },
  recordingText: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
  },
  timerText: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xl,
  },
  pulsingCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primary + '30',
  },
  stopButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  tapToStopText: {
    fontSize: FontSize.m,
    color: Colors.textSecondary,
    marginTop: Spacing.l,
  },
  processingTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
  },
  processingText: {
    fontSize: FontSize.m,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  loadingContainer: {
    width: 200,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  processingBar: {
    position: 'absolute',
    width: 100,
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: Spacing.m,
    paddingBottom: 100,
  },
  recognizedTextContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadow.small,
  },
  recognizedLabel: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  recognizedText: {
    fontSize: FontSize.l,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: Spacing.s,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: FontSize.s,
    color: Colors.success,
    marginLeft: 4,
  },
  detailsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    ...Shadow.small,
  },
  detailsTitle: {
    fontSize: FontSize.l,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  detailsSubtitle: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    marginBottom: Spacing.m,
  },
  inputGroup: {
    marginBottom: Spacing.m,
  },
  inputLabel: {
    fontSize: FontSize.s,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.s,
    padding: Spacing.s,
  },
  currencySymbol: {
    fontSize: FontSize.l,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: FontSize.l,
    fontWeight: '500',
    color: Colors.textPrimary,
    padding: 0,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.s,
    padding: Spacing.s,
    fontSize: FontSize.m,
    color: Colors.textPrimary,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.s,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m,
    margin: 4,
  },
  categoryOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: FontSize.s,
    color: Colors.textPrimary,
  },
  categoryTextSelected: {
    color: '#fff',
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.s,
    padding: Spacing.m,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: FontSize.m,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  confirmButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.s,
    padding: Spacing.m,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: FontSize.m,
    fontWeight: '500',
    color: '#fff',
  },
});
